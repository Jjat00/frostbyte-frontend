import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check, QrCode as QrCodeIcon, Loader2 } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import {
  loadQrPrefs,
  saveQrPrefs,
  buildQrOptions,
  buildTableUrl,
  buildLabeledQrBlob,
  downloadBlob,
  qrFileName,
} from '@/lib/qrStyling';
import QrStyleControls from '@/components/orders/QrStyleControls';

const PREVIEW = 220;

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
        {/* backgroundColor inline: la hoja flota sobre la pantalla, así que
                  necesita fondo opaco de verdad — el vidrio de `fb-card` solo no
                  basta para que el texto se lea encima. */}
        <div
          className="fb-card max-h-[90vh] space-y-4 overflow-y-auto p-5"
          style={{ backgroundColor: 'rgba(18, 20, 31, 0.96)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5 text-secondary" />
              <h3 className="font-display text-[0.9rem] font-semibold uppercase tracking-[0.12em] text-light">
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

          {/* Controles de estilo (compartidos con la impresión) */}
          <QrStyleControls prefs={prefs} set={set} />

          <p className="text-xs text-gray/70">
            Usa buen contraste (puntos oscuros sobre fondo claro) para que escanee bien. Los ajustes
            se guardan y se usan también al imprimir todos.
          </p>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary/35 bg-secondary/[0.1] text-light rounded-lg hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
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
