import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Loader2, Plus, Minus } from 'lucide-react';
import {
  loadQrPrefs,
  saveQrPrefs,
  buildTableUrl,
  renderQrBlob,
  blobToDataUrl,
  tableCaption,
} from '@/lib/qrStyling';
import QrStyleControls from '@/components/orders/QrStyleControls';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const COLUMN_OPTIONS = [
  { value: 1, label: '1 por fila', hint: 'grande' },
  { value: 2, label: '2 por fila', hint: 'mediano' },
  { value: 3, label: '3 por fila', hint: 'pequeño' },
];

const floorLabel = (floor) => (floor ? `Piso ${floor}` : 'Sin piso');
const shortName = (t) =>
  t.table_name || (t.table_number === 0 ? 'Barra' : `Mesa ${t.table_number}`);

/**
 * Genera los QR de las mesas elegidas con el estilo elegido (mismo panel de
 * personalización que el generador por mesa) y arma una hoja imprimible.
 *
 * Control sobre el contenido de cada hoja:
 *  - Selección mesa por mesa (checkbox) y preajustes rápidos por piso.
 *  - Copias por mesa (para tener repuestos o llenar la hoja con duplicados).
 *  - Relleno automático de la última fila cuando quedan celdas vacías
 *    (ej: 7 QR en una grilla de 3 columnas dejan 2 huecos en la última fila).
 */
const QrPrintDialog = ({ tables, onClose }) => {
  const [prefs, setPrefs] = useState(loadQrPrefs);
  const [columns, setColumns] = useState(2);
  // copies[tableId] = nº de copias; 0 = no se imprime. Por defecto 1 (todas).
  const [copies, setCopies] = useState(() =>
    Object.fromEntries((tables || []).map((t) => [t.id, 1])),
  );
  const [autoFill, setAutoFill] = useState(false);
  const [cardMap, setCardMap] = useState({}); // tableId -> { dataUrl, caption }
  const [generating, setGenerating] = useState(true);

  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));

  useEffect(() => saveQrPrefs(prefs), [prefs]);

  // Si cambia la lista de mesas, asegurar una entrada para cada una (nuevas => 1).
  useEffect(() => {
    setCopies((prev) => {
      const next = {};
      for (const t of tables || []) next[t.id] = prev[t.id] ?? 1;
      return next;
    });
  }, [tables]);

  const floors = useMemo(
    () => [...new Set((tables || []).map((t) => t.floor ?? 0))].sort((a, b) => a - b),
    [tables],
  );

  const includedTables = useMemo(
    () => (tables || []).filter((t) => (copies[t.id] || 0) > 0),
    [tables, copies],
  );
  const includedKey = includedTables.map((t) => t.id).join(',');

  // Regenerar los QR cuando cambia el conjunto de mesas incluidas o el estilo
  // (con un pequeño respiro para no rehacerlos en cada tecla/arrastre).
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      setGenerating(true);
      const map = {};
      for (const t of includedTables) {
        try {
          const blob = await renderQrBlob(prefs, buildTableUrl(prefs, t), 700);
          if (!blob) continue;
          map[t.id] = { dataUrl: await blobToDataUrl(blob), caption: tableCaption(t) };
        } catch {
          /* saltar la que falle */
        }
      }
      if (alive) {
        setCardMap(map);
        setGenerating(false);
      }
    }, 350);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // includedKey (string) evita rehacer los QR al solo cambiar el nº de copias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedKey, prefs]);

  // Nº de QR antes del relleno (suma de copias de las mesas incluidas).
  const baseCount = useMemo(
    () => includedTables.reduce((sum, t) => sum + (copies[t.id] || 0), 0),
    [includedTables, copies],
  );
  const holes = baseCount && baseCount % columns !== 0 ? columns - (baseCount % columns) : 0;

  // Lista final expandida (copias + relleno de la última fila) para vista y print.
  const expanded = useMemo(() => {
    const base = [];
    for (const t of includedTables) {
      const card = cardMap[t.id];
      if (!card) continue;
      const n = copies[t.id] || 0;
      for (let i = 0; i < n; i++) base.push({ key: `${t.id}-${i}`, ...card });
    }
    if (autoFill && base.length && base.length % columns !== 0) {
      const remaining = columns - (base.length % columns);
      for (let i = 0; i < remaining; i++) {
        const src = base[i % base.length];
        base.push({ key: `fill-${i}`, dataUrl: src.dataUrl, caption: src.caption });
      }
    }
    return base;
  }, [includedTables, cardMap, copies, autoFill, columns]);

  // --- Selección ---
  const setCopy = (id, val) => setCopies((c) => ({ ...c, [id]: Math.max(0, val) }));
  const toggle = (id) => setCopies((c) => ({ ...c, [id]: (c[id] || 0) > 0 ? 0 : 1 }));
  const selectAll = () =>
    setCopies((c) =>
      Object.fromEntries((tables || []).map((t) => [t.id, Math.max(1, c[t.id] || 0)])),
    );
  const selectNone = () =>
    setCopies(Object.fromEntries((tables || []).map((t) => [t.id, 0])));
  const onlyFloor = (f) =>
    setCopies((c) =>
      Object.fromEntries(
        (tables || []).map((t) => [
          t.id,
          (t.floor ?? 0) === f ? Math.max(1, c[t.id] || 0) : 0,
        ]),
      ),
    );
  const setFloorCopies = (f, val) =>
    setCopies((c) => {
      const next = { ...c };
      for (const t of tables || []) if ((t.floor ?? 0) === f) next[t.id] = val;
      return next;
    });

  const handlePrint = () => {
    if (!expanded.length) return;
    const cols = columns;
    const labelPt = cols === 1 ? 20 : cols === 2 ? 15 : 12;
    const hintPt = cols === 1 ? 11 : cols === 2 ? 9 : 8;
    const cells = expanded
      .map(
        (c) => `
      <div class="card">
        <img src="${c.dataUrl}" alt="" />
        ${prefs.withCaption ? `<div class="label">${escapeHtml(c.caption)}</div>` : ''}
        <div class="hint">Escanéame para ver la carta y pedir</div>
      </div>`,
      )
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>QR mesas</title>
      <style>
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; }
        .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 8mm; }
        .card { break-inside: avoid; page-break-inside: avoid; text-align: center; border: 1.5px dashed #bbb; border-radius: 14px; padding: 6mm; }
        .card img { width: 100%; height: auto; display: block; }
        .label { font-weight: 800; margin-top: 3mm; font-size: ${labelPt}pt; }
        .hint { color: #666; margin-top: 1mm; font-size: ${hintPt}pt; }
      </style></head><body><div class="grid">${cells}</div></body></html>`;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
    });
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    const fire = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } finally {
        setTimeout(() => iframe.remove(), 1500);
      }
    };
    // Las imágenes son data URLs (embebidas), así que basta un pequeño respiro.
    setTimeout(fire, 300);
  };

  const chipBase =
    'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border';
  const stepBtn =
    'w-6 h-6 flex items-center justify-center rounded-md bg-white/[0.06] border border-white/[0.1] text-light hover:bg-white/[0.12] disabled:opacity-30 disabled:hover:bg-white/[0.06]';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg z-50 p-4"
      >
        {/* relative: contiene el reflejo (::before/::after) dentro de la card.
            backgroundColor inline: opaco real; el fondo translúcido de
            .liquid-glass gana la cascada al bg-dark de utilidad y transparentaba. */}
        <div
          className="liquid-glass relative border border-white/[0.12] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: 'rgba(18, 20, 31, 0.96)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-light">Imprimir QR de mesas</h3>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-gray hover:text-light rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Qué imprimir: preajustes + selección por mesa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray">Qué imprimir</label>
              <span className="text-[11px] text-gray/70">
                {expanded.length} QR · {includedTables.length} mesas
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={selectAll}
                className={`${chipBase} bg-white/[0.04] text-gray border-white/[0.1] hover:text-light`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={selectNone}
                className={`${chipBase} bg-white/[0.04] text-gray border-white/[0.1] hover:text-light`}
              >
                Ninguna
              </button>
              {floors.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onlyFloor(f)}
                  className={`${chipBase} bg-secondary/10 text-secondary border-secondary/30 hover:bg-secondary/20`}
                  title={`Imprimir solo ${floorLabel(f)}`}
                >
                  Solo {floorLabel(f)}
                </button>
              ))}
            </div>

            <div className="max-h-44 overflow-y-auto rounded-lg border border-white/[0.1] divide-y divide-white/[0.06]">
              {floors.map((f) => {
                const list = (tables || []).filter((t) => (t.floor ?? 0) === f);
                return (
                  <div key={f}>
                    <div className="sticky top-0 z-10 bg-dark/95 backdrop-blur px-3 py-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                        {floorLabel(f)}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setFloorCopies(f, 1)}
                          className="text-gray hover:text-light"
                        >
                          todas
                        </button>
                        <span className="text-gray/40">·</span>
                        <button
                          type="button"
                          onClick={() => setFloorCopies(f, 0)}
                          className="text-gray hover:text-light"
                        >
                          ninguna
                        </button>
                      </div>
                    </div>
                    {list.map((t) => {
                      const n = copies[t.id] || 0;
                      const on = n > 0;
                      return (
                        <div key={t.id} className="flex items-center gap-2 px-3 py-2">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(t.id)}
                            className="w-4 h-4 accent-secondary flex-shrink-0"
                          />
                          <span
                            className={`flex-1 text-sm truncate ${on ? 'text-light' : 'text-gray/50'}`}
                          >
                            {shortName(t)}
                          </span>
                          {on && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setCopy(t.id, n - 1)}
                                disabled={n <= 1}
                                className={stepBtn}
                                title="Menos copias"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-sm text-light tabular-nums">
                                {n}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCopy(t.id, n + 1)}
                                className={stepBtn}
                                title="Más copias"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vista previa de la hoja */}
          <div className="bg-white rounded-xl p-3 max-h-[40vh] overflow-y-auto">
            {generating ? (
              <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando {includedTables.length} QR…
              </div>
            ) : expanded.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No hay mesas seleccionadas para imprimir.
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {expanded.map((c) => (
                  <div
                    key={c.key}
                    className="text-center border border-dashed border-gray-300 rounded-lg p-2"
                  >
                    <img src={c.dataUrl} alt="" className="w-full h-auto" />
                    {prefs.withCaption && (
                      <div className="text-gray-900 font-bold text-xs mt-1 leading-tight">
                        {c.caption}
                      </div>
                    )}
                    <div className="text-gray-500 text-[10px] leading-tight">
                      Escanéame para ver la carta
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cuántos por fila */}
          <div>
            <label className="block text-xs text-gray mb-1">Cuántos por fila</label>
            <div className="grid grid-cols-3 gap-2">
              {COLUMN_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setColumns(o.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    columns === o.value
                      ? 'bg-secondary/20 text-secondary border border-secondary/40'
                      : 'bg-white/[0.04] text-gray border border-white/[0.1] hover:text-light'
                  }`}
                >
                  <span className="block">{o.value}</span>
                  <span className="block text-[10px] opacity-70">{o.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Relleno de la última fila */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
              <input
                type="checkbox"
                checked={autoFill}
                onChange={(e) => setAutoFill(e.target.checked)}
                className="w-4 h-4 accent-secondary"
              />
              Rellenar la última fila con copias
            </label>
            {!autoFill && holes > 0 && (
              <p className="text-[11px] text-amber-300/80">
                Quedan {holes} hueco{holes > 1 ? 's' : ''} en la última fila. Activa el relleno,
                ajusta las copias o suma otra mesa.
              </p>
            )}
          </div>

          {/* Personalización del estilo (compartida con el generador por mesa) */}
          <QrStyleControls prefs={prefs} set={set} showSize={false} />

          <p className="text-xs text-gray/70">
            Se imprime en A4; recorta por la línea punteada y pega en cada mesa. El estilo se
            comparte con el generador por mesa.
          </p>

          <button
            type="button"
            onClick={handlePrint}
            disabled={generating || expanded.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Imprimir {expanded.length ? `(${expanded.length})` : ''}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default QrPrintDialog;
