import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check, QrCode as QrCodeIcon, Loader2 } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import {
  DOT_TYPES,
  CORNER_TYPES,
  SIZE_PRESETS,
  loadQrPrefs,
  saveQrPrefs,
  buildQrOptions,
  buildTableUrl,
  buildLabeledQrBlob,
  downloadBlob,
  qrFileName,
} from '@/lib/qrStyling';

const PREVIEW = 220;

const selectClass =
  'w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light text-sm focus:border-secondary/50 focus:outline-none';

/**
 * Generador de QR por mesa con degradados, formas y logo. Arma la URL con piso
 * incluido (/mesa/:floor/:tableNumber) desde la mesa real y guarda las
 * preferencias en localStorage para reusarlas (incl. impresión masiva).
 */
const QrCodeModal = ({ table, onClose }) => {
  const [prefs, setPrefs] = useState(loadQrPrefs);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const holderRef = useRef(null);
  const qrRef = useRef(null);

  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));
  const url = useMemo(() => buildTableUrl(prefs, table), [prefs, table]);

  useEffect(() => saveQrPrefs(prefs), [prefs]);

  // Crear la instancia de preview una vez.
  useEffect(() => {
    if (!holderRef.current) return undefined;
    const qr = new QRCodeStyling(buildQrOptions(prefs, url, PREVIEW));
    holderRef.current.innerHTML = '';
    qr.append(holderRef.current);
    qrRef.current = qr;
    return () => {
      if (holderRef.current) holderRef.current.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refrescar el preview con cada cambio.
  useEffect(() => {
    qrRef.current?.update(buildQrOptions(prefs, url, PREVIEW));
  }, [prefs, url]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await buildLabeledQrBlob(prefs, table);
      if (blob) downloadBlob(blob, qrFileName(table));
    } finally {
      setDownloading(false);
    }
  };

  const isGradient = prefs.fillMode === 'gradient';

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
        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md z-50 p-4"
      >
        <div className="liquid-glass bg-dark border border-white/[0.12] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-light">
                QR · {table.table_name} · Piso {table.floor}
              </h3>
            </div>
            <button type="button" onClick={onClose} className="p-2 text-gray hover:text-light rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vista previa en vivo */}
          <div className="flex justify-center">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div ref={holderRef} style={{ width: PREVIEW, height: PREVIEW }} />
            </div>
          </div>

          {/* URL + copiar */}
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate text-xs text-secondary bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2">
              {url}
            </code>
            <button
              type="button"
              onClick={copyUrl}
              className="p-2.5 text-gray hover:text-secondary bg-white/[0.05] border border-white/[0.1] rounded-lg transition-colors"
              title="Copiar link"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Relleno: solido / degradado */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray mb-1">Relleno</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'solid', l: 'Sólido' },
                  { v: 'gradient', l: 'Degradado' },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set({ fillMode: v })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      prefs.fillMode === v
                        ? 'bg-secondary/20 text-secondary border border-secondary/40'
                        : 'bg-white/[0.04] text-gray border border-white/[0.1] hover:text-light'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {!isGradient ? (
              <label className="flex items-center justify-between gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2">
                <span>Color de puntos</span>
                <input
                  type="color"
                  value={prefs.fgColor}
                  onChange={(e) => set({ fgColor: e.target.value })}
                  className="w-8 h-8 bg-transparent cursor-pointer"
                />
              </label>
            ) : (
              <div className="space-y-3 bg-white/[0.03] border border-white/[0.08] rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'linear', l: 'Lineal' },
                    { v: 'radial', l: 'Radial' },
                  ].map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set({ gradientType: v })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        prefs.gradientType === v
                          ? 'bg-secondary/20 text-secondary border border-secondary/40'
                          : 'bg-white/[0.04] text-gray border border-white/[0.1] hover:text-light'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-between gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2">
                    <span>Color 1</span>
                    <input
                      type="color"
                      value={prefs.gradientColor1}
                      onChange={(e) => set({ gradientColor1: e.target.value })}
                      className="w-8 h-8 bg-transparent cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2">
                    <span>Color 2</span>
                    <input
                      type="color"
                      value={prefs.gradientColor2}
                      onChange={(e) => set({ gradientColor2: e.target.value })}
                      className="w-8 h-8 bg-transparent cursor-pointer"
                    />
                  </label>
                </div>
                {prefs.gradientType === 'linear' && (
                  <div>
                    <label className="block text-xs text-gray mb-1">
                      Rotación: {prefs.gradientRotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={prefs.gradientRotation}
                      onChange={(e) => set({ gradientRotation: Number(e.target.value) })}
                      className="w-full accent-secondary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Formas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray mb-1">Forma de puntos</label>
                <select
                  value={prefs.dotsType}
                  onChange={(e) => set({ dotsType: e.target.value })}
                  className={selectClass}
                >
                  {DOT_TYPES.map((o) => (
                    <option key={o.value} value={o.value} className="bg-dark">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray mb-1">Esquinas</label>
                <select
                  value={prefs.cornersType}
                  onChange={(e) => set({ cornersType: e.target.value })}
                  className={selectClass}
                >
                  {CORNER_TYPES.map((o) => (
                    <option key={o.value} value={o.value} className="bg-dark">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fondo */}
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-between gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 ${
                  prefs.bgTransparent ? 'opacity-40' : ''
                }`}
              >
                <span>Fondo</span>
                <input
                  type="color"
                  value={prefs.bgColor}
                  disabled={prefs.bgTransparent}
                  onChange={(e) => set({ bgColor: e.target.value })}
                  className="w-8 h-8 bg-transparent cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.bgTransparent}
                  onChange={(e) => set({ bgTransparent: e.target.checked })}
                  className="w-4 h-4 accent-secondary"
                />
                Transparente
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.withLogo}
                onChange={(e) => set({ withLogo: e.target.checked })}
                className="w-4 h-4 accent-secondary"
              />
              Logo en el centro
            </label>

            <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.withCaption}
                onChange={(e) => set({ withCaption: e.target.checked })}
                className="w-4 h-4 accent-secondary"
              />
              Etiqueta debajo (Mesa · Piso)
            </label>

            <div>
              <label className="block text-xs text-gray mb-1">Tamaño de descarga</label>
              <div className="flex gap-2">
                {SIZE_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set({ downloadSize: s })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      prefs.downloadSize === s
                        ? 'bg-secondary/20 text-secondary border border-secondary/40'
                        : 'bg-white/[0.04] text-gray border border-white/[0.1] hover:text-light'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray mb-1">Dominio base (para todos los QR)</label>
              <input
                type="text"
                value={prefs.baseUrl}
                onChange={(e) => set({ baseUrl: e.target.value })}
                placeholder="https://frostbyte.com.co"
                className={selectClass}
              />
            </div>
          </div>

          <p className="text-xs text-gray/70">
            Usa buen contraste (puntos oscuros sobre fondo claro) para que escanee bien. Los ajustes
            se guardan y se usan también al imprimir todos.
          </p>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Descargar PNG
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default QrCodeModal;
