#!/bin/bash
# Установка CCC-агента Алисы на сервер
# Использование: bash install.sh

set -e

AGENT_NAME="alice"
AGENT_DIR="$HOME/$AGENT_NAME"

echo "=== Установка агента Алисы ==="
echo ""

# 1. Проверить Node.js
echo "[1/6] Проверяю Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js не найден. Устанавливаю..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js $(node -v) — OK"
fi

# 2. Проверить Claude Code
echo ""
echo "[2/6] Проверяю Claude Code..."
if ! command -v claude &> /dev/null; then
    echo "Claude Code не найден. Устанавливаю..."
    npm install -g @anthropic-ai/claude-code
else
    echo "Claude Code — OK"
fi

# 3. Проверить tmux
echo ""
echo "[3/6] Проверяю tmux..."
if ! command -v tmux &> /dev/null; then
    echo "Устанавливаю tmux..."
    apt-get install -y tmux
else
    echo "tmux — OK"
fi

# 4. Создать структуру папок
echo ""
echo "[4/6] Создаю структуру папок в $AGENT_DIR..."
mkdir -p "$AGENT_DIR/memory/project"
mkdir -p "$AGENT_DIR/reference"
mkdir -p "$AGENT_DIR/drafts"
mkdir -p "$AGENT_DIR/data"
echo "Папки созданы — OK"

# 5. Скопировать файлы агента
echo ""
echo "[5/6] Копирую файлы агента..."

# CLAUDE.md
cp "$(dirname "$0")/CLAUDE.md" "$AGENT_DIR/CLAUDE.md"
cp "$(dirname "$0")/ACTIVE.md" "$AGENT_DIR/ACTIVE.md"
cp "$(dirname "$0")/zadachi.md" "$AGENT_DIR/zadachi.md"
cp -r "$(dirname "$0")/memory/." "$AGENT_DIR/memory/"
cp -r "$(dirname "$0")/reference/." "$AGENT_DIR/reference/"

echo "Файлы скопированы — OK"

# 6. Итог
echo ""
echo "=== Установка завершена! ==="
echo ""
echo "Структура агента:"
find "$AGENT_DIR" -not -path '*/.git/*' | sort | sed 's|'"$HOME"'||' | sed 's|[^/]*/|  |g'
echo ""
echo "=== Следующие шаги ==="
echo ""
echo "1. Создай бота в Telegram:"
echo "   → Открой @BotFather → /newbot → получи токен"
echo ""
echo "2. Запусти агента:"
echo "   tmux new-session -s $AGENT_NAME \"cd $AGENT_DIR && claude --channels plugin:telegram@claude-plugins-official\""
echo ""
echo "3. Передай токен бота агенту в диалоге"
echo ""
echo "4. Настрой безопасность (напиши агенту):"
echo "   «Поставь policy allowlist — только я могу тебе писать»"
echo ""
echo "5. Закрепи команду восстановления:"
echo "   ssh root@\$(hostname -I | awk '{print \$1}') && tmux attach -t $AGENT_NAME"
echo ""
