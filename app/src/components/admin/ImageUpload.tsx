import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

// ---------------------------------------------------------------
// ImageUpload — drag-and-drop or click-to-upload for vehicle
// images. Shows preview thumbnails with remove capability.
// In demo mode, just creates local object URLs for preview.
// ---------------------------------------------------------------

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onUpload?: (file: File) => Promise<string>;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  onUpload,
  maxImages = 10,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported format. Use JPG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds the 5MB size limit.`;
    }
    return null;
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError('');
      const fileArray = Array.from(files);

      // Check count
      if (images.length + fileArray.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed. You have ${images.length}.`);
        return;
      }

      // Validate all files
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setUploading(true);
      const newUrls: string[] = [];

      try {
        for (const file of fileArray) {
          if (onUpload) {
            const url = await onUpload(file);
            newUrls.push(url);
          } else {
            // Fallback: local object URL for preview
            newUrls.push(URL.createObjectURL(file));
          }
        }
        onImagesChange([...images, ...newUrls]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Upload failed. Please try again.',
        );
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, onUpload, maxImages],
  );

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      // Reset the input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Preview thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-white/5 group"
            >
              <img
                src={url}
                alt={`Vehicle image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              {/* Index badge */}
              <span className="absolute bottom-1 left-1 bg-black/70 text-white/60 text-[10px] px-1.5 py-0.5 rounded museo-label">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleFileSelect}
        className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
              <span className="text-white/40 text-sm">Uploading...</span>
            </>
          ) : (
            <>
              {dragActive ? (
                <ImageIcon className="w-8 h-8 text-[#D4AF37]" />
              ) : (
                <Upload className="w-8 h-8 text-white/20" />
              )}
              <div>
                <span className="text-white/50 text-sm">
                  {dragActive ? 'Drop images here' : 'Drag and drop images or'}{' '}
                  {!dragActive && (
                    <span className="text-[#D4AF37] hover:underline">browse</span>
                  )}
                </span>
              </div>
              <span className="text-white/20 text-xs">
                JPG, PNG, WebP up to 5MB ({images.length}/{maxImages})
              </span>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
