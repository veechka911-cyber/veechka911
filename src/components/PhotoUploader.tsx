import { useRef, useState } from 'react';

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ

export function PhotoUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Файл слишком большой. Попробуйте до 8 МБ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      onChange(result);
    };
    reader.onerror = () => setError('Не удалось прочитать файл.');
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div>
        <div className="photo-preview">
          <img src={value} alt="Загруженное фото блюда" />
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            Загрузить другое фото
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`photo-zone ${dragOver ? 'photo-zone--drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
      >
        <div style={{ fontSize: 38, marginBottom: 12 }} aria-hidden>
          🍽️
        </div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Перетащите фото сюда</div>
        <div className="muted small">или нажмите, чтобы выбрать файл</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn--secondary" onClick={() => inputRef.current?.click()}>
          Выбрать фото
        </button>
      </div>
      {error && (
        <div className="disclaimer mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
