# Инструкция по развёртыванию агента на сервере

## 1. Арендовать VPS
- Beget: https://beget.com — до 2 000 руб./мес, российская карта
- Timeweb: https://timeweb.com — до 5 000 руб./мес, российская карта
- Нужен **зарубежный** сервер (российский — нестабильно через VPN)

## 2. Подключиться по SSH
```bash
# Windows: Win+R → cmd
ssh root@ВАШ_IP
# При вводе пароля символы не отображаются — это нормально
```

## 3. Установить Claude Code на сервере
```bash
npm install -g @anthropic-ai/claude-code
```

## 4. Создать структуру папок
```bash
mkdir -p ~/alice/memory/project
mkdir -p ~/alice/reference
mkdir -p ~/alice/drafts
mkdir -p ~/alice/data
```

## 5. Загрузить файлы агента
Скопировать все файлы из этого репозитория в `~/alice/` на сервере.

## 6. Создать бота в Telegram
- Написать @BotFather → `/newbot`
- Получить токен (выглядит как: `1234567890:AAF...`)

## 7. Запустить агента
```bash
tmux new-session -s alice "cd ~/alice && claude --channels plugin:telegram@claude-plugins-official"
```
- Передать токен бота агенту в диалоге
- Настроить allowlist: *«Поставь policy allowlist — только я могу тебе писать»*

## 8. Команда быстрого восстановления
```bash
ssh root@ВАШ_IP && tmux attach -t alice
```
Закрепить эту команду в Telegram-диалоге с ботом!

## 9. Подключить Notion (опционально)
- notion.so/my-integrations → Create new connection → скопировать токен (`ntn_...`)
- Написать агенту: *«Давай подключимся к Notion по API. Вот токен: ntn_...»*
