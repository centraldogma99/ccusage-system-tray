#!/bin/bash

# Bun 설치 스크립트
echo "🚀 Bun 설치 중..."
curl -fsSL https://bun.sh/install | bash

# Bun 환경변수 설정
echo ""
echo "⚙️  Bun 환경변수 설정 중..."

# .zshrc에 Bun 환경변수 추가
ZSHRC="$HOME/.zshrc"
BUN_ENV_LINES='
# Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"'

# 이미 설정되어 있는지 확인
if ! grep -q "BUN_INSTALL" "$ZSHRC" 2>/dev/null; then
    echo "$BUN_ENV_LINES" >> "$ZSHRC"
    echo "✅ ~/.zshrc에 Bun 환경변수를 추가했습니다."
else
    echo "ℹ️  Bun 환경변수가 이미 설정되어 있습니다."
fi

# .bashrc에도 추가 (bash 사용자를 위해)
BASHRC="$HOME/.bashrc"
if [ -f "$BASHRC" ]; then
    if ! grep -q "BUN_INSTALL" "$BASHRC" 2>/dev/null; then
        echo "$BUN_ENV_LINES" >> "$BASHRC"
        echo "✅ ~/.bashrc에도 Bun 환경변수를 추가했습니다."
    fi
fi

source ~/.zshrc
source ~/.bashrc