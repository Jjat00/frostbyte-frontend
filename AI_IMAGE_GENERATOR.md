# AI Image Generator - Feature Documentation

## Descripción General

Sistema de generación de imágenes profesionales de productos usando OpenAI GPT Image 1.5. Permite transformar fotografías básicas de productos en imágenes de alta calidad para el menú digital.

## Estructura de Archivos

### Servicios (`/src/services/`)

#### `aiImage.service.js`
Servicio principal para interactuar con la API de generación de imágenes.

**Métodos:**
- `generateImage({ originalImage, referenceImage, prompt, transparent })` - Genera imagen con IA
- `getHistory(params)` - Obtiene historial de generaciones
- `getGenerationById(id)` - Obtiene detalles de una generación
- `saveToProduct(generationId, productId)` - Guarda imagen en un producto
- `downloadImage(imageUrl, filename)` - Descarga imagen generada
- `regenerateImage(generationId, newParams)` - Regenera con nuevos parámetros

### Hooks Personalizados (`/src/hooks/`)

#### `useImageGeneration.js`
Hook principal para manejar el flujo de generación de imágenes.

**Retorna:**
```javascript
{
  // Estados
  isGenerating: boolean,
  isSaving: boolean,
  isRegenerating: boolean,
  uploadProgress: number,
  generatedData: object,

  // Acciones
  generateImage: function,
  saveToProduct: function,
  regenerateImage: function,
  downloadImage: function,

  // Errores
  generateError: object,
  saveError: object,

  // Utilidades
  reset: function
}
```

**Ejemplo de uso:**
```javascript
const {
  isGenerating,
  generateImage,
  generatedData,
} = useImageGeneration({
  onSuccess: (data) => console.log('Generado:', data),
});

// Generar imagen
generateImage({
  originalImage: file,
  prompt: 'Fotografía profesional de producto',
  transparent: true,
});
```

#### `useGenerationHistory.js`
Hook para obtener el historial de generaciones con React Query.

```javascript
const { data, isLoading } = useGenerationHistory({ page: 1 });
```

#### `useImageValidation.js`
Hook para validar archivos de imagen.

**Configuración:**
- Formatos permitidos: JPG, PNG, WebP
- Tamaño máximo: 10MB

```javascript
const { validateFile, ALLOWED_TYPES, MAX_SIZE } = useImageValidation();
const error = validateFile(file);
```

#### `useImageUpload.js`
Hook para manejar drag & drop y previews de imágenes.

```javascript
const {
  isDragging,
  preview,
  file,
  handleDrop,
  handleDragOver,
  handleFileSelect,
  clearFile,
} = useImageUpload();
```

### Componentes (`/src/components/ai-generator/`)

#### `DualImageUploader.jsx`
Componente para subir imagen original y de referencia con drag & drop.

**Props:**
```typescript
{
  onOriginalSelect: (file: File) => void,
  onReferenceSelect: (file: File) => void,
  originalError?: string,
  referenceError?: string,
  disabled?: boolean
}
```

**Features:**
- Drag & drop para ambas imágenes
- Preview en tiempo real
- Validación de formato y tamaño
- Botón para remover imagen

#### `PromptBuilder.jsx`
Constructor de prompts con plantillas predefinidas.

**Props:**
```typescript
{
  value: string,
  onChange: (value: string) => void,
  error?: string,
  disabled?: boolean
}
```

**Plantillas disponibles:**
1. Fotografía profesional
2. Más apetitoso
3. Estilo minimalista
4. Más colorido
5. Premium/Gourmet
6. Casual/Friendly

**Límites:**
- Máximo 500 caracteres
- Contador de caracteres en tiempo real

#### `TransparencyToggle.jsx`
Toggle para activar/desactivar fondo transparente.

**Props:**
```typescript
{
  value: boolean,
  onChange: (value: boolean) => void,
  disabled?: boolean
}
```

**Features:**
- Switch visual animado
- Preview de comparación (con fondo vs transparente)
- Descripción dinámica

#### `GenerationProgress.jsx`
Modal de progreso durante la generación.

**Props:**
```typescript
{
  uploadProgress: number,
  isUploading: boolean,
  isGenerating: boolean
}
```

**Estados:**
- Subiendo archivos (con barra de progreso)
- Generando con IA (con animación)
- Overlay fullscreen con backdrop blur

#### `ImagePreview.jsx`
Visor de resultados con comparación antes/después.

**Props:**
```typescript
{
  originalUrl: string,
  generatedUrl: string,
  prompt?: string,
  transparent?: boolean
}
```

**Features:**
- Comparación con slider interactivo
- Vista solo resultado
- Fullscreen mode
- Patrón checkboard para transparencias
- Labels "Original" y "Generada"

#### `GeneratedImageActions.jsx`
Botones de acción para imagen generada.

**Props:**
```typescript
{
  imageUrl: string,
  generationId: number,
  onDownload: () => void,
  onSaveToProduct: () => void,
  onRegenerate: () => void,
  onDiscard: () => void,
  isSaving?: boolean,
  isRegenerating?: boolean
}
```

**Acciones:**
- Descargar imagen
- Guardar en producto
- Regenerar con nuevos parámetros
- Descartar resultado
- Ver en nueva pestaña

### Página Principal (`/src/pages/products/`)

#### `AIImageGeneratorPage.jsx`
Página completa del generador de imágenes.

**Features:**
- Flujo completo de generación
- Validación de formulario
- Manejo de estados (idle, uploading, generating, success, error)
- Mensajes de error y éxito
- Botón "Generar Nueva Imagen"
- Navegación breadcrumb

**Flujo de Usuario:**
1. Subir imagen original (requerido)
2. Subir imagen de referencia (opcional)
3. Escribir prompt o seleccionar plantilla (opcional)
4. Activar fondo transparente (opcional)
5. Click en "Generar Imagen con IA"
6. Ver progreso de subida y generación
7. Revisar resultado con comparación
8. Descargar o guardar en producto

## Endpoints de API

Los endpoints están definidos en `/src/services/api/endpoints.js`:

```javascript
{
  AI_GENERATE_IMAGE: '/ai/generate-image/',
  AI_GENERATION_HISTORY: '/ai/generation-history/',
  AI_GENERATION_DETAIL: (id) => `/ai/generation-history/${id}/`,
  AI_SAVE_TO_PRODUCT: (generationId) => `/ai/generation-history/${generationId}/save-to-product/`,
}
```

### Request Example

**POST** `/api/v1/ai/generate-image/`

```javascript
FormData {
  original_image: File,
  reference_image: File, // opcional
  prompt: "Fotografía profesional...",
  transparent_background: true
}
```

**Response:**
```json
{
  "id": 123,
  "original_image_url": "https://...",
  "reference_image_url": "https://...",
  "generated_image_url": "https://...",
  "prompt": "Fotografía profesional...",
  "transparent_background": true,
  "created_at": "2026-01-29T10:00:00Z",
  "status": "completed"
}
```

## Integración con Productos

### Desde ProductFormPage
Agregar botón para abrir el generador:

```jsx
import { Sparkles } from 'lucide-react';

<button
  onClick={() => navigate('/productos/generador-ia')}
  className="flex items-center gap-2 px-4 py-2.5 bg-dark-secondary border border-secondary/30 text-secondary rounded-lg"
>
  <Sparkles className="w-5 h-5" />
  Generar con IA
</button>
```

### Guardar en Producto
Implementar modal selector de productos en `GeneratedImageActions`:

```javascript
const handleSaveToProduct = () => {
  // Mostrar modal con lista de productos
  // Al seleccionar producto:
  saveToProduct({
    generationId: generatedData.id,
    productId: selectedProduct.id
  });
};
```

## Rutas

```
/productos/generador-ia - Página del generador (Admin only)
```

Definido en `/src/router.jsx`:

```javascript
{
  path: "generador-ia",
  element: (
    <AdminRoute>
      <AIImageGeneratorPage />
    </AdminRoute>
  ),
}
```

## Validaciones Frontend

### Imagen Original
- ✅ Requerida
- ✅ Formato: JPG, PNG, WebP
- ✅ Tamaño máximo: 10MB

### Imagen de Referencia
- ✅ Opcional
- ✅ Formato: JPG, PNG, WebP
- ✅ Tamaño máximo: 10MB

### Prompt
- ✅ Opcional
- ✅ Máximo 500 caracteres

## Estado Management

### Local State (useState)
- Imágenes seleccionadas
- Prompt
- Fondo transparente
- Errores de validación

### React Query
- Cache de generaciones (5 minutos)
- Invalidación automática al generar
- Manejo de loading y errores

### Zustand
No se usa para esta feature (todo con local state y React Query).

## Performance

### Optimizaciones
- Lazy loading de imágenes
- Progress bar para uploads
- Timeout extendido para IA (120 segundos)
- Skeleton loaders en historial
- Debounce en búsqueda de historial

### Code Splitting
```javascript
const AIImageGeneratorPage = lazy(() =>
  import('@/pages/products/AIImageGeneratorPage')
);
```

## Accesibilidad

- ✅ Labels ARIA para todos los inputs
- ✅ Keyboard navigation
- ✅ Focus states visibles
- ✅ Mensajes de error descriptivos
- ✅ Alt text en imágenes
- ✅ Contraste WCAG AAA

## Testing (Estructura sugerida)

```javascript
// useImageGeneration.test.js
describe('useImageGeneration', () => {
  it('should generate image successfully', async () => {
    // Test implementation
  });

  it('should handle validation errors', () => {
    // Test implementation
  });
});

// AIImageGeneratorPage.test.jsx
describe('AIImageGeneratorPage', () => {
  it('should render form correctly', () => {
    // Test implementation
  });

  it('should validate required fields', () => {
    // Test implementation
  });
});
```

## Próximas Mejoras

1. **Historial de Generaciones**
   - Componente de historial en sidebar
   - Filtros por fecha, estado
   - Paginación

2. **Modal Selector de Productos**
   - Búsqueda de productos
   - Preview antes de guardar
   - Confirmación visual

3. **Batch Processing**
   - Generar múltiples imágenes a la vez
   - Cola de procesamiento
   - Notificaciones push

4. **Advanced Editing**
   - Ajuste de brillo/contraste
   - Crop antes de generar
   - Filters presets

5. **Analytics**
   - Tracking de uso
   - Tasa de éxito
   - Tiempo promedio de generación

## Troubleshooting

### Error: "Timeout exceeded"
- Aumentar timeout en `apiClient.js`
- Verificar conexión a internet
- Verificar estado del servidor de IA

### Error: "File too large"
- Comprimir imagen antes de subir
- Ajustar MAX_SIZE en validación

### Error: "Invalid format"
- Convertir imagen a formato soportado
- Verificar ALLOWED_TYPES

## Contacto

Para dudas o sugerencias sobre esta feature, contactar al equipo de desarrollo.

---

**Última actualización:** 2026-01-29
**Versión:** 1.0.0
