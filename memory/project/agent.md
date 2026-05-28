# Проект: ИИ-агент в Telegram

## Статус
В процессе настройки

## Конфигурация
- Имя агента: Алиса
- Платформа: Claude Code Channels (CCC)
- Сервер: зарубежный VPS (Beget или Timeweb)
- Бот: создать через @BotFather

## Шаги запуска
1. Арендовать VPS-сервер (зарубежный)
2. Подключиться по SSH: `ssh root@IP`
3. Запустить агента:
   ```bash
   tmux new-session -s alice "cd ~/alice && claude --channels plugin:telegram@claude-plugins-official"
   ```
4. Передать токен бота агенту
5. Настроить allowlist (только Вера может писать)

## Команда быстрого восстановления
```bash
ssh root@ВАШ_IP
tmux attach -t alice
# если сессии нет:
cd ~/alice && tmux new-session -s alice "claude --channels plugin:telegram@claude-plugins-official"
```

## Интеграции (планируется)
- Notion (память + дашборды)
- Vercel Mini App (трекер здоровья)
