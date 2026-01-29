import { useState, useCallback } from 'react';

/**
 * Hook para manejar la subida de imágenes con drag & drop
 */
export function useImageUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleDrop = useCallback(
    (e, onFileSelect) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setError(null);

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(droppedFile);

        onFileSelect?.(droppedFile);
      } else {
        setError('El archivo debe ser una imagen');
      }
    },
    []
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e, onFileSelect) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setError(null);

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);

        onFileSelect?.(selectedFile);
      }
      // Reset input
      e.target.value = '';
    },
    []
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return {
    isDragging,
    preview,
    file,
    error,
    setError,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    clearFile,
  };
}

export default useImageUpload;
