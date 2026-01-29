import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Componente para preview de imágenes con comparación antes/después
 * @param {Object} props
 * @param {string} props.originalUrl - URL de la imagen original
 * @param {string} props.generatedUrl - URL de la imagen generada
 * @param {string} props.prompt - Prompt usado para generar
 * @param {boolean} props.transparent - Si tiene fondo transparente
 */
export function ImagePreview({
  originalUrl,
  generatedUrl,
  prompt,
  transparent = false,
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-light flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-secondary" />
            Resultado
          </h3>
          <p className="text-sm text-gray">
            Desliza para comparar antes y después
          </p>
        </div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-3 py-1.5 text-xs bg-dark-secondary border border-gray/20 rounded-lg text-light hover:bg-dark transition-colors"
        >
          {showComparison ? 'Ver solo resultado' : 'Comparar'}
        </button>
      </div>

      {/* Preview container */}
      <div className="bg-dark-secondary border border-gray/20 rounded-xl overflow-hidden">
        {showComparison ? (
          /* Comparison view */
          <div className="relative aspect-video overflow-hidden">
            {/* Background pattern para transparencia */}
            {transparent && (
              <div
                className="absolute inset-0 bg-[length:20px_20px]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />
            )}

            {/* Generated image */}
            <div className="absolute inset-0">
              <img
                src={generatedUrl}
                alt="Generated"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Original image con clip-path */}
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <img
                src={originalUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-secondary cursor-ew-resize z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                <SlidersHorizontal className="w-4 h-4 text-dark" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-dark/80 backdrop-blur-sm border border-gray/30 rounded-lg text-xs text-light font-medium">
              Original
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-dark/80 backdrop-blur-sm border border-secondary/30 rounded-lg text-xs text-secondary font-medium">
              Generada
            </div>

            {/* Slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-2 bg-dark/80 backdrop-blur-sm border border-gray/30 rounded-lg text-light hover:bg-dark transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Solo imagen generada */
          <div className="relative aspect-video">
            {transparent && (
              <div
                className="absolute inset-0 bg-[length:20px_20px]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />
            )}
            <img
              src={generatedUrl}
              alt="Generated"
              className="w-full h-full object-contain relative z-10"
            />
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-2 bg-dark/80 backdrop-blur-sm border border-gray/30 rounded-lg text-light hover:bg-dark transition-colors z-20"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info card */}
      {prompt && (
        <div className="bg-dark border border-gray/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-light mb-2">
            Prompt utilizado:
          </h4>
          <p className="text-xs text-gray italic">{prompt}</p>
        </div>
      )}

      {/* Fullscreen modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-6xl w-full">
            {transparent && (
              <div
                className="absolute inset-0 bg-[length:20px_20px] rounded-lg"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />
            )}
            <img
              src={generatedUrl}
              alt="Generated fullscreen"
              className="w-full h-auto max-h-[90vh] object-contain relative z-10"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 px-4 py-2 bg-dark/80 backdrop-blur-sm border border-gray/30 rounded-lg text-light hover:bg-dark transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ImagePreview;
