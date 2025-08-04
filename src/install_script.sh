#!/bin/bash

# Claude Usage for macOS Quarantine 제거 스크립트

APP_NAME="Claude Code Usage Monitor.app"
INSTALL_PATH="/Applications"
curl -fsSL https://bun.sh/install | bash


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