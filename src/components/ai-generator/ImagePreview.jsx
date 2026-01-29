import { ImageIcon } from "lucide-react";

/**
 * Preview: imágenes originales que subió el usuario y luego la imagen generada.
 * Sin slider de comparación.
 */
export function ImagePreview({
  originalUrl,
  referenceUrl = null,
  generatedUrl,
  prompt,
  transparent = false,
}) {
  const checkerboardStyle = transparent
    ? {
        backgroundImage:
          "linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)",
        backgroundPosition: "0 0, 10px 10px",
        backgroundSize: "20px 20px",
      }
    : {};

  return (
    <div className="space-y-6">
      {/* Imágenes originales */}
      <div>
        <h3 className="text-lg font-bold text-light flex items-center gap-2 mb-3">
          <ImageIcon className="w-5 h-5 text-secondary" />
          Imágenes originales
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <p className="text-xs text-gray mb-1.5">Original</p>
            <div className="bg-dark border border-gray/20 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
              <img
                src={originalUrl}
                alt="Imagen original"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {referenceUrl && (
            <div className="flex-1 min-w-[200px] max-w-sm">
              <p className="text-xs text-gray mb-1.5">Referencia de estilo</p>
              <div className="bg-dark border border-gray/20 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                <img
                  src={referenceUrl}
                  alt="Referencia de estilo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Imagen generada */}
      <div>
        <h3 className="text-lg font-bold text-light flex items-center gap-2 mb-3">
          <ImageIcon className="w-5 h-5 text-secondary" />
          Imagen generada
        </h3>
        <div
          className="bg-dark border border-gray/20 rounded-xl overflow-hidden aspect-video flex items-center justify-center min-h-[280px]"
          style={checkerboardStyle}
        >
          <img
            src={generatedUrl}
            alt="Imagen generada"
            className="w-full h-full object-contain relative z-10"
          />
        </div>
      </div>

      {/* Prompt utilizado */}
      {prompt && (
        <div className="bg-dark border border-gray/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-light mb-2">
            Prompt utilizado
          </h4>
          <p className="text-xs text-gray italic">{prompt}</p>
        </div>
      )}
    </div>
  );
}

export default ImagePreview;
