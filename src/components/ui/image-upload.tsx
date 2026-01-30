import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from './button';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { Upload, X, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
  required?: boolean;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ImageUpload = ({
  label = 'Изображение',
  value,
  onChange,
  maxSizeMB = 10,
  acceptedFormats = ACCEPTED_FORMATS,
  className,
  required = false,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(value || '');
  const [originalValue, setOriginalValue] = useState<string>(value || '');
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Синхронизация preview с внешним value (для редактирования)
  useEffect(() => {
    setPreview(value || '');
    setOriginalValue(value || '');
  }, [value]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    // Проверка типа файла
    if (!acceptedFormats.includes(file.type)) {
      const formats = acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
      return `Поддерживаются только форматы: ${formats}`;
    }

    // Проверка размера файла
    if (file.size > maxSizeBytes) {
      return `Размер файла не должен превышать ${maxSizeMB} МБ`;
    }

    return null;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // Конвертируем в Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Ошибка при загрузке файла');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Не удалось загрузить изображение');
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    setIsLoading(true);

    const file = e.dataTransfer.files[0];
    if (!file) {
      setIsLoading(false);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onChange(base64String);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Ошибка при загрузке файла');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Не удалось загрузить изображение');
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setShowDeleteDialog(false);
    setPreview('');
    onChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Определяем, было ли изображение изменено
  const isModified = preview !== originalValue;
  const hasImage = !!preview;

  return (
    <div className={cn('grid gap-2', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Preview */}
      {preview ? (
        <div className="space-y-3">
          <div className="relative rounded-lg border-2 border-border overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            {isModified && (
              <div className="absolute top-2 left-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Изменено
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isLoading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Заменить фотографию
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/50',
            error && 'border-destructive',
            isLoading && 'opacity-50 cursor-wait'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isLoading ? handleClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
            required={required && !preview}
            disabled={isLoading}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-3">
              <ImageIcon className={cn('h-6 w-6 text-primary', isLoading && 'animate-pulse')} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isLoading ? 'Загрузка...' : 'Нажмите или перетащите файл'}
              </p>
              {!isLoading && (
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP до {maxSizeMB} МБ
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Info */}
      {preview && !error && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isModified 
              ? originalValue 
                ? 'Новое изображение будет сохранено' 
                : 'Изображение загружено успешно'
              : 'Текущее изображение'}
          </span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить фотографию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту фотографию? Это действие можно будет отменить до сохранения формы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
