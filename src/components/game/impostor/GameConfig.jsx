import React from 'react';
import { Settings, Eye, EyeOff, Shield, Clock, MessageCircle, RotateCw, Sparkles } from 'lucide-react';
import CategorySelector from './CategorySelector';

const ToggleOption = ({ label, description, icon: Icon, enabled, onChange }) => (
  <div
    className="flex items-center justify-between gap-4 bg-dark/60 border border-gray/20 rounded-xl px-4 py-3 cursor-pointer"
    onClick={() => onChange(!enabled)}
  >
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Icon className={`w-5 h-5 flex-shrink-0 ${enabled ? 'text-secondary' : 'text-gray/40'}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-light">{label}</p>
        {description && <p className="text-xs text-gray/50 truncate">{description}</p>}
      </div>
    </div>
    <div
      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${
        enabled ? 'bg-secondary' : 'bg-gray/30'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </div>
);

const SegmentedOption = ({ label, icon: Icon, options, value, onChange }) => (
  <div className="bg-dark/60 border border-gray/20 rounded-xl px-4 py-3 space-y-3">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-secondary" />
      <p className="text-sm font-medium text-light">{label}</p>
    </div>
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
            value === opt.value
              ? 'bg-secondary/20 border border-secondary text-secondary'
              : 'bg-dark/40 border border-gray/20 text-gray/60 hover:text-gray'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const GameConfig = ({ config, onUpdateConfig, playerCount }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-bold text-light">Configuración</h3>
      </div>

      <div className="space-y-3">
        {/* Impostores */}
        <SegmentedOption
          label="Impostores"
          icon={Eye}
          options={[
            { value: 1, label: '1 Impostor' },
            { value: 2, label: '2 Impostores' },
          ]}
          value={config.impostorCount}
          onChange={(v) => onUpdateConfig({ impostorCount: v })}
        />

        {/* Rondas */}
        <SegmentedOption
          label="Rondas"
          icon={RotateCw}
          options={[
            { value: 1, label: '1' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
          ]}
          value={config.totalRounds}
          onChange={(v) => onUpdateConfig({ totalRounds: v })}
        />

        {/* Timer por turno */}
        <SegmentedOption
          label="Tiempo por turno"
          icon={Clock}
          options={[
            { value: null, label: 'Sin límite' },
            { value: 15, label: '15s' },
            { value: 30, label: '30s' },
            { value: 45, label: '45s' },
          ]}
          value={config.turnTimerSeconds}
          onChange={(v) => onUpdateConfig({ turnTimerSeconds: v })}
        />

        {/* Timer discusión */}
        <SegmentedOption
          label="Tiempo de discusión"
          icon={MessageCircle}
          options={[
            { value: null, label: 'Sin límite' },
            { value: 60, label: '1 min' },
            { value: 120, label: '2 min' },
            { value: 180, label: '3 min' },
          ]}
          value={config.discussionTimerSeconds}
          onChange={(v) => onUpdateConfig({ discussionTimerSeconds: v })}
        />

        {/* Toggles */}
        <ToggleOption
          label="Palabra trampa"
          description="El impostor ve una palabra similar"
          icon={EyeOff}
          enabled={config.trapWordEnabled}
          onChange={(v) => onUpdateConfig({ trapWordEnabled: v })}
        />

        <ToggleOption
          label="Pista al impostor"
          description="El impostor ve la categoría"
          icon={Eye}
          enabled={config.hintEnabled}
          onChange={(v) => onUpdateConfig({ hintEnabled: v })}
        />

        <ToggleOption
          label="Rol Espia"
          description="Un jugador sabe quien es el impostor"
          icon={Shield}
          enabled={config.spyEnabled}
          onChange={(v) => onUpdateConfig({ spyEnabled: v })}
        />

        <ToggleOption
          label="Palabras con IA"
          description="Genera palabras unicas con inteligencia artificial"
          icon={Sparkles}
          enabled={config.useAiWords}
          onChange={(v) => onUpdateConfig({ useAiWords: v })}
        />
      </div>

      {/* Categoría */}
      <CategorySelector
        selected={config.categorySlug || 'random'}
        onSelect={(slug) =>
          onUpdateConfig({
            categorySlug: slug === 'random' ? null : slug,
          })
        }
      />
    </div>
  );
};

export default GameConfig;
