/**
 * Утилиты для работы с изображениями
 */

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Проверка, является ли строка base64 изображением
 */
export const isBase64Image = (str: string): boolean => {
  if (!str) return false;
  return str.startsWith('data:image/');
};

/**
 * Получение типа MIME из base64 строки
 */
export const getMimeTypeFromBase64 = (base64: string): string | null => {
  const match = base64.match(/^data:([^;]+);/);
  return match ? match[1] : null;
};

/**
 * Получение размера base64 изображения в байтах
 */
export const getBase64Size = (base64: string): number => {
  // Убираем префикс data:image/...;base64,
  const base64Data = base64.split(',')[1];
  if (!base64Data) return 0;
  
  // Вычисляем размер: длина base64 * 3/4 (с учетом padding)
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
};

/**
 * Валидация изображения (серверная сторона)
 */
export const validateImage = (base64: string): { valid: boolean; error?: string } => {
  // Проверка формата
  if (!isBase64Image(base64)) {
    return { valid: false, error: 'Неверный формат изображения' };
  }

  // Проверка MIME типа
  const mimeType = getMimeTypeFromBase64(base64);
  if (!mimeType || !ACCEPTED_FORMATS.includes(mimeType)) {
    const formats = ACCEPTED_FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ');
    return { valid: false, error: `Поддерживаются только форматы: ${formats}` };
  }

  // Проверка размера
  const sizeBytes = getBase64Size(base64);
  if (sizeBytes > MAX_SIZE_BYTES) {
    return { valid: false, error: `Размер файла не должен превышать ${MAX_SIZE_MB} МБ` };
  }

  return { valid: true };
};

/**
 * Конвертация base64 в Blob (для дальнейшей обработки)
 */
export const base64ToBlob = (base64: string): Blob | null => {
  try {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch {
    return null;
  }
};

/**
 * Создание URL для предпросмотра из base64
 */
export const createPreviewUrl = (base64: string): string => {
  const blob = base64ToBlob(base64);
  if (!blob) return base64;
  return URL.createObjectURL(blob);
};
