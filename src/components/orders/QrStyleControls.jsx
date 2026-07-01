import React from 'react';
import { DOT_TYPES, CORNER_TYPES, SIZE_PRESETS } from '@/lib/qrStyling';

const selectClass =
  'w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light text-sm focus:border-secondary/50 focus:outline-none';

/**
 * Controles de estilo del QR (relleno sólido/degradado, formas, fondo, logo,
 * etiqueta, tamaño, dominio). Compartido por el generador por mesa y el
 * diálogo de impresión masiva. `set(patch)` mezcla en las prefs.
 */
const QrStyleControls = ({ prefs, set, showSize = true, showCaption = true }) => {
  const isGradient = prefs.fillMode === 'gradient';

  return (
    <div className="space-y-3">
      {/* Relleno: sólido / degradado */}
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
              <label className="block text-xs text-gray mb-1">Rotación: {prefs.gradientRotation}°</label>
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

      {showCaption && (
        <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.withCaption}
            onChange={(e) => set({ withCaption: e.target.checked })}
            className="w-4 h-4 accent-secondary"
          />
          Etiqueta debajo (Mesa · Piso)
        </label>
      )}

      {showSize && (
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
      )}

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
  );
};

export default QrStyleControls;
