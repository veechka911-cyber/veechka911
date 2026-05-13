import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PhotoUploader } from '../components/PhotoUploader';
import { Steps } from '../components/Steps';
import { useAppState } from '../store/AppState';

export function UploadPage() {
  const navigate = useNavigate();
  const { photoDataUrl, setPhotoDataUrl } = useAppState();

  return (
    <div>
      <Steps total={5} current={0} />
      <h1>Загрузите фото еды</h1>
      <p className="lead">
        Лучше сфотографировать блюдо сверху или немного сбоку, чтобы были видны основные продукты.
      </p>

      <Card variant="default">
        <PhotoUploader value={photoDataUrl} onChange={setPhotoDataUrl} />
      </Card>

      <Card variant="soft" title="Подсказка">
        <p className="mb-0">
          Если блюдо сложное — например суп, салат, паста, запеканка или десерт — приложение может ошибаться.
          Поэтому дальше будут уточняющие вопросы.
        </p>
      </Card>

      <Card variant="berry" title="О приватности">
        <p className="mb-0">
          В демо-версии фото не анализируется AI-моделью и не отправляется во внешние сервисы. Разбор
          формируется по выбранному типу блюда и вашим ответам.
        </p>
      </Card>

      <div className="btn-row">
        <Button variant="primary" disabled={!photoDataUrl} onClick={() => navigate('/dish-type')}>
          Продолжить
        </Button>
        {!photoDataUrl && (
          <Button variant="ghost" onClick={() => navigate('/dish-type')}>
            Пропустить — разобрать без фото
          </Button>
        )}
      </div>
    </div>
  );
}
