import { LinkButton } from '../components/Button';
import { Card } from '../components/Card';

const CONTACTS = [
  { label: 'Telegram', href: '#telegram' },
  { label: 'MAX', href: '#max' },
  { label: 'Instagram', href: '#instagram' },
  { label: 'WhatsApp', href: '#whatsapp' },
];

export function OfferPage() {
  return (
    <div>
      <h1>Хотите разобраться глубже?</h1>
      <p className="lead">
        Если вы устали от диет, подсчёта калорий и ощущения «я опять всё делаю неправильно», можно начать с
        понятной системы питания без крайностей.
      </p>

      <Card variant="accent" title="Мини-курс «Минус без жёстких диет»">
        <p>
          14 дней, чтобы разобраться с методом тарелки, визуальными порциями, частыми ошибками в рационе и
          сытным питанием без отдельной готовки.
        </p>
        <div className="btn-row">
          <LinkButton variant="primary" to="#mini-course" external>
            Хочу мини-курс
          </LinkButton>
        </div>
      </Card>

      <Card variant="green" title="Информационный разбор питания и анализов">
        <p>
          Образовательный разбор пищевых привычек, рациона и показателей, которые обычно обсуждают с врачом
          при сложностях со снижением веса.
        </p>
        <div className="btn-row">
          <LinkButton variant="olive" to="#info-review" external>
            Узнать про разбор
          </LinkButton>
        </div>
      </Card>

      <Card variant="soft" title="Можно написать мне напрямую">
        <div className="btn-row">
          {CONTACTS.map((c) => (
            <LinkButton key={c.label} variant="secondary" to={c.href} external>
              {c.label}
            </LinkButton>
          ))}
        </div>
        <p className="small muted mt-3 mb-0">
          Все ссылки сейчас — заглушки. В рабочей версии связь и переписка будут идти через сервисы и
          сервера, размещённые на территории РФ.
        </p>
      </Card>
    </div>
  );
}
