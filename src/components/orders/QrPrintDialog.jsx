import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Loader2 } from 'lucide-react';
import {
  loadQrPrefs,
  buildTableUrl,
  renderQrBlob,
  blobToDataUrl,
  tableCaption,
} from '@/lib/qrStyling';

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

/**
 * Genera los QR de todas las mesas indicadas con el estilo guardado y arma una
 * hoja imprimible (1/2/3 por fila) lista para recortar y pegar en la mesa.
 */
const QrPrintDialog = ({ tables, onClose }) => {
  const [columns, setColumns] = useState(2);
  const [cards, setCards] = useState([]);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setGenerating(true);
      const prefs = loadQrPrefs();
      const result = [];
      for (const t of tables) {
        try {
          const blob = await renderQrBlob(prefs, buildTableUrl(prefs, t), 700);
          if (!blob) continue;
          const dataUrl = await blobToDataUrl(blob);
          result.push({ id: t.id, dataUrl, caption: tableCaption(t) });
        } catch {
          /* saltar la que falle */
        }
      }
      if (alive) {
        setCards(result);
        setGenerating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tables]);

  const handlePrint = () => {
    if (!cards.length) return;
    const cols = columns;
    const labelPt = cols === 1 ? 20 : cols === 2 ? 15 : 12;
    const hintPt = cols === 1 ? 11 : cols === 2 ? 9 : 8;
    const cells = cards
      .map(
        (c) => `
      <div class="card">
        <img src="${c.dataUrl}" alt="" />
        <div class="label">${escapeHtml(c.caption)}</div>
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
        <div className="liquid-glass bg-dark border border-white/[0.12] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-light">Imprimir todos los QR</h3>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-gray hover:text-light rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

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

          {/* Vista previa de la hoja */}
          <div className="bg-white rounded-xl p-3 max-h-[45vh] overflow-y-auto">
            {generating ? (
              <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando {tables.length} QR…
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No hay mesas para imprimir.</div>
            ) : (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className="text-center border border-dashed border-gray-300 rounded-lg p-2"
                  >
                    <img src={c.dataUrl} alt="" className="w-full h-auto" />
                    <div className="text-gray-900 font-bold text-xs mt-1 leading-tight">
                      {c.caption}
                    </div>
                    <div className="text-gray-500 text-[10px] leading-tight">
                      Escanéame para ver la carta
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray/70">
            Usa el diseño guardado en el generador (colores, forma, logo). Se imprime en A4; recorta
            por la línea punteada y pega en cada mesa.
          </p>

          <button
            type="button"
            onClick={handlePrint}
            disabled={generating || cards.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Imprimir {cards.length ? `(${cards.length})` : ''}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default QrPrintDialog;
