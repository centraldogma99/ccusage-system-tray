#!/bin/bash

# Claude Usage for macOS 설치 및 설정 스크립트

APP_NAME="Claude Code Usage Monitor.app"
INSTALL_PATH="/Applications"

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

# 현재 세션에도 적용
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo ""


# 앱이 설치되어 있는지 확인
if [ ! -d "${INSTALL_PATH}/${APP_NAME}" ]; then
    echo "❌ 오류: ${APP_NAME}이 설치되어 있지 않습니다."
    echo "먼저 앱을 /Applications 폴더에 설치해주세요."
    exit 1
fi

echo "✅ ${APP_NAME}을 찾았습니다."
echo ""

# Quarantine 속성 제거 (macOS Gatekeeper 우회)
xattr -cr "${INSTALL_PATH}/${APP_NAME}" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 보안 속성이 성공적으로 제거되었습니다."
else
    echo "⚠️  경고: 보안 속성을 제거할 수 없습니다."
    echo "관리자 권한이 필요할 수 있습니다. 다음 명령어를 직접 실행해보세요:"
    echo ""
    echo "  sudo xattr -cr \"${INSTALL_PATH}/${APP_NAME}\""
    echo ""
    exit 1
fi

echo "완료! 🎉"