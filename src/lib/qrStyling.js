import QRCodeStyling from 'qr-code-styling';

// Preferencias del generador de QR de mesas. Se guardan en localStorage para
// que diseñes una vez y sirva para todas las mesas (incluida la impresión masiva).
export const QR_PREFS_KEY = 'frostbyte_qr_prefs_v2';

export const DEFAULT_QR_PREFS = {
  baseUrl: 'https://frostbyte.com.co',
  fillMode: 'solid', // 'solid' | 'gradient'
  fgColor: '#0b0b14',
  gradientType: 'linear', // 'linear' | 'radial'
  gradientColor1: '#ff00d4',
  gradientColor2: '#00e0ff',
  gradientRotation: 45, // grados
  dotsType: 'rounded',
  cornersType: 'extra-rounded',
  bgColor: '#ffffff',
  bgTransparent: false,
  withLogo: true,
  withCaption: true,
  downloadSize: 1024,
};

export const DOT_TYPES = [
  { value: 'square', label: 'Cuadrado' },
  { value: 'rounded', label: 'Redondeado' },
  { value: 'dots', label: 'Puntos' },
  { value: 'classy', label: 'Elegante' },
  { value: 'classy-rounded', label: 'Elegante redondo' },
  { value: 'extra-rounded', label: 'Muy redondo' },
];

export const CORNER_TYPES = [
  { value: 'square', label: 'Cuadrada' },
  { value: 'dot', label: 'Punto' },
  { value: 'extra-rounded', label: 'Redonda' },
];

export const SIZE_PRESETS = [512, 1024, 2048];

export const loadQrPrefs = () => {
  try {
    const raw = localStorage.getItem(QR_PREFS_KEY);
    return raw ? { ...DEFAULT_QR_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_QR_PREFS };
  } catch {
    return { ...DEFAULT_QR_PREFS };
  }
};

export const saveQrPrefs = (prefs) => {
  try {
    localStorage.setItem(QR_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
};

export const tableSlug = (table) => (table.table_number === 0 ? 'barra' : table.table_number);

export const buildTableUrl = (prefs, table) =>
  `${(prefs.baseUrl || '').replace(/\/+$/, '')}/mesa/${table.floor}/${tableSlug(table)}`;

export const tableCaption = (table) =>
  `${
    table.table_name || (table.table_number === 0 ? 'Barra' : `Mesa ${table.table_number}`)
  } · Piso ${table.floor}`;

const fillFor = (prefs) =>
  prefs.fillMode === 'gradient'
    ? {
        gradient: {
          type: prefs.gradientType,
          rotation: (Number(prefs.gradientRotation) || 0) * (Math.PI / 180),
          colorStops: [
            { offset: 0, color: prefs.gradientColor1 },
            { offset: 1, color: prefs.gradientColor2 },
          ],
        },
      }
    : { color: prefs.fgColor };

export const buildQrOptions = (prefs, url, size) => {
  const fill = fillFor(prefs);
  return {
    width: size,
    height: size,
    type: 'canvas',
    data: url,
    margin: Math.round(size * 0.04),
    qrOptions: { errorCorrectionLevel: prefs.withLogo ? 'H' : 'M' },
    image: prefs.withLogo ? '/logo.png' : undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 6,
      imageSize: 0.38,
      hideBackgroundDots: true,
    },
    dotsOptions: { type: prefs.dotsType, ...fill },
    cornersSquareOptions: { type: prefs.cornersType, ...fill },
    cornersDotOptions: { ...fill },
    backgroundOptions: { color: prefs.bgTransparent ? 'rgba(0,0,0,0)' : prefs.bgColor },
  };
};

// Genera el QR como Blob PNG sin necesidad de montarlo en el DOM.
export const renderQrBlob = async (prefs, url, size) => {
  const qr = new QRCodeStyling(buildQrOptions(prefs, url, size));
  return qr.getRawData('png');
};

const blobToImage = (blob) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });

export const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

// PNG final con la etiqueta debajo, listo para descargar una mesa.
export const buildLabeledQrBlob = async (prefs, table) => {
  const url = buildTableUrl(prefs, table);
  const s = prefs.downloadSize;
  const qrBlob = await renderQrBlob(prefs, url, s);
  const img = await blobToImage(qrBlob);
  const pad = Math.round(s * 0.06);
  const captionH = prefs.withCaption ? Math.round(s * 0.16) : 0;

  const out = document.createElement('canvas');
  out.width = s + pad * 2;
  out.height = s + pad * 2 + captionH;
  const ctx = out.getContext('2d');
  if (!prefs.bgTransparent) {
    ctx.fillStyle = prefs.bgColor;
    ctx.fillRect(0, 0, out.width, out.height);
  }
  ctx.drawImage(img, pad, pad, s, s);
  URL.revokeObjectURL(img.src);

  if (prefs.withCaption) {
    ctx.fillStyle = prefs.fillMode === 'gradient' ? prefs.gradientColor1 : prefs.fgColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(s * 0.07)}px "Segoe UI", system-ui, sans-serif`;
    ctx.fillText(tableCaption(table), out.width / 2, s + pad + captionH / 2 + pad * 0.15);
  }

  return new Promise((resolve) => out.toBlob((b) => resolve(b), 'image/png'));
};

export const downloadBlob = (blob, filename) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const qrFileName = (table) =>
  `qr-piso${table.floor}-${table.table_number === 0 ? 'barra' : 'mesa' + table.table_number}.png`;
