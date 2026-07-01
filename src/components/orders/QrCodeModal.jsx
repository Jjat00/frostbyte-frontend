import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Check, QrCode as QrCodeIcon } from 'lucide-react';

const PREFS_KEY = 'frostbyte_qr_prefs';

const DEFAULT_PREFS = {
  baseUrl: 'https://frostbyte.com.co',
  fgColor: '#000000',
  bgColor: '#ffffff',
  withLogo: true,
  withCaption: true,
  downloadSize: 1024,
};

const SIZE_PRESETS = [512, 1024, 2048];

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
};

/**
 * Generador de QR por mesa. Arma la URL con piso incluido
 * (/mesa/:floor/:tableNumber) desde la fuente de verdad (la mesa) y deja
 * personalizar colores, logo, etiqueta y tamaño antes de descargar el PNG.
 */
const QrCodeModal = ({ table, onClose }) => {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [caption, setCaption] = useState('');
  const [copied, setCopied] = useState(false);
  const fullRef = useRef(null);

  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const isBarra = table.table_number === 0;
  const slug = isBarra ? 'barra' : table.table_number;

  const url = useMemo(
    () => `${prefs.baseUrl.replace(/\/+$/, '')}/mesa/${table.floor}/${slug}`,
    [prefs.baseUrl, table.floor, slug],
  );

  const defaultCaption = `${
    table.table_name || (isBarra ? 'Barra' : `Mesa ${table.table_number}`)
  } · Piso ${table.floor}`;
  const effectiveCaption = caption.trim() || defaultCaption;

  // Con logo encima hace falta el nivel de corrección alto para que siga escaneando.
  const level = prefs.withLogo ? 'H' : 'M';

  const logoSettings = (size) =>
    prefs.withLogo
      ? { src: '/logo.png', height: Math.round(size * 0.2), width: Math.round(size * 0.2), excavate: true }
      : undefined;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const qrCanvas = fullRef.current?.querySelector('canvas');
    if (!qrCanvas) return;
    const s = prefs.downloadSize;
    const pad = Math.round(s * 0.08);
    const captionH = prefs.withCaption ? Math.round(s * 0.16) : 0;

    const out = document.createElement('canvas');
    out.width = s + pad * 2;
    out.height = s + pad * 2 + captionH;
    const ctx = out.getContext('2d');
    ctx.fillStyle = prefs.bgColor;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(qrCanvas, pad, pad, s, s);

    if (prefs.withCaption) {
      ctx.fillStyle = prefs.fgColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.round(s * 0.075)}px "Segoe UI", system-ui, sans-serif`;
      ctx.fillText(effectiveCaption, out.width / 2, s + pad + captionH / 2 + pad * 0.15);
    }

    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-piso${table.floor}-${isBarra ? 'barra' : 'mesa' + table.table_number}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
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
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray hover:text-light rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vista previa */}
          <div className="flex justify-center">
            <div className="p-3 rounded-xl" style={{ backgroundColor: prefs.bgColor }}>
              <QRCodeCanvas
                value={url}
                size={200}
                bgColor={prefs.bgColor}
                fgColor={prefs.fgColor}
                level={level}
                marginSize={2}
                imageSettings={logoSettings(200)}
              />
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

          {/* Personalización */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2">
                <span>Puntos</span>
                <input
                  type="color"
                  value={prefs.fgColor}
                  onChange={(e) => set({ fgColor: e.target.value })}
                  className="w-8 h-8 bg-transparent cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-sm text-light bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2">
                <span>Fondo</span>
                <input
                  type="color"
                  value={prefs.bgColor}
                  onChange={(e) => set({ bgColor: e.target.value })}
                  className="w-8 h-8 bg-transparent cursor-pointer"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.withLogo}
                onChange={(e) => set({ withLogo: e.target.checked })}
                className="w-4 h-4 accent-secondary"
              />
              Incluir logo en el centro
            </label>

            <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.withCaption}
                onChange={(e) => set({ withCaption: e.target.checked })}
                className="w-4 h-4 accent-secondary"
              />
              Incluir etiqueta debajo
            </label>

            {prefs.withCaption && (
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={defaultCaption}
                className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light text-sm focus:border-secondary/50 focus:outline-none"
              />
            )}

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
              <label className="block text-xs text-gray mb-1">
                Dominio base (para todos los QR)
              </label>
              <input
                type="text"
                value={prefs.baseUrl}
                onChange={(e) => set({ baseUrl: e.target.value })}
                placeholder="https://frostbyte.com.co"
                className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light text-sm focus:border-secondary/50 focus:outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-gray/70">
            Usa buen contraste (puntos oscuros sobre fondo claro) para que escanee bien. La
            preferencia se guarda para el resto de mesas.
          </p>

          <button
            type="button"
            onClick={download}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95"
          >
            <Download className="w-4 h-4" />
            Descargar PNG
          </button>
        </div>
      </motion.div>

      {/* QR a resolución completa (oculto) que se usa para la descarga */}
      <div
        ref={fullRef}
        aria-hidden
        style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}
      >
        <QRCodeCanvas
          value={url}
          size={prefs.downloadSize}
          bgColor={prefs.bgColor}
          fgColor={prefs.fgColor}
          level={level}
          marginSize={2}
          imageSettings={logoSettings(prefs.downloadSize)}
        />
      </div>
    </>
  );
};

export default QrCodeModal;
