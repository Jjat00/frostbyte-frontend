import { cn } from "@/lib/utils";
import { Cpu, Zap, Crown, Sparkles } from "lucide-react";

const AI_MODELS = [
  {
    id: "gemini-3-pro-image-preview",
    name: "Gemini Pro Image",
    provider: "Google",
    description: "Mejor calidad, texto nitido",
    icon: Crown,
    badge: null,
    badgeColor: null,
  },
  {
    id: "gemini-3.1-flash-image-preview",
    name: "Gemini Flash Image",
    provider: "Google",
    description: "Rapido y eficiente",
    icon: Zap,
    badge: null,
    badgeColor: null,
  },
  {
    id: "gpt-image-1.5",
    name: "GPT Image 1.5",
    provider: "OpenAI",
    description: "Alta calidad, fondo transparente nativo",
    icon: Cpu,
    badge: "Recomendado",
    badgeColor: "text-secondary",
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    provider: "OpenAI",
    description: "Texto nítido, edición multi-referencia, 4K",
    icon: Sparkles,
    badge: "Nuevo",
    badgeColor: "text-primary",
  },
];

/**
 * Selector de modelo de IA para generacion de imagenes
 */
export function ModelSelector({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-light">
        Modelo de IA
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {AI_MODELS.map((model) => {
          const Icon = model.icon;
          const isSelected = value === model.id;

          return (
            <button
              key={model.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(model.id)}
              className={cn(
                "relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left",
                "hover:border-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected
                  ? "border-secondary bg-secondary/10 shadow-md shadow-secondary/10"
                  : "border-gray/20 bg-dark/50 hover:bg-dark/80"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isSelected ? "text-secondary" : "text-gray"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-bold",
                    isSelected ? "text-light" : "text-gray"
                  )}
                >
                  {model.name}
                </span>
              </div>

              <span className="text-[10px] text-gray/60 uppercase tracking-wider">
                {model.provider}
              </span>

              <span
                className={cn(
                  "text-xs",
                  isSelected ? "text-light/80" : "text-gray/70"
                )}
              >
                {model.description}
              </span>

              {model.badge && (
                <span
                  className={cn(
                    "absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider",
                    model.badgeColor || "text-secondary"
                  )}
                >
                  {model.badge}
                </span>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-px -left-px -right-px -bottom-px rounded-xl border-2 border-secondary pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
