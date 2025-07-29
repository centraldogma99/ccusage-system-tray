# Claude Usage Monitor for macOS

Claude Code의 토큰 사용량을 macOS 메뉴바에 실시간으로 표시하는 앱입니다.

## 기능

- **실시간 토큰 사용량 표시**: 메뉴바에 현재 세션의 토큰 사용량과 비용을 표시
- **세부 정보 창**: 클릭하면 자세한 사용량 정보를 확인할 수 있는 창이 열림
- **자동 새로고침**: 5초마다 자동으로 사용량 데이터를 업데이트
- **모델별 사용량**: Opus, Sonnet 등 모델별 토큰 사용량 표시
- **일일 사용량**: 오늘의 총 사용량 정보 제공

## 요구사항

- macOS
- Node.js 20.19.4 이상
- Claude Code가 설치되어 있어야 함
- `ccusage` 라이브러리가 동작할 수 있는 환경 (Claude Code 사용 기록이 있어야 함)

## 설치 및 실행

1. 저장소 클론:
```bash
git clone https://github.com/your-username/claude-usage-macos.git
cd claude-usage-macos
```

2. 의존성 설치:
```bash
npm install
```

3. 개발 모드로 실행:
```bash
npm run dev
```

4. 앱 빌드 (선택사항):
```bash
npm run build
```

## 사용법

1. 앱을 실행하면 메뉴바 상단에 토큰 사용량이 표시됩니다
2. 메뉴바 아이콘을 클릭하면 컨텍스트 메뉴가 나타납니다:
   - **Show Details**: 자세한 사용량 정보창을 엽니다
   - **Refresh**: 수동으로 데이터를 새로고침합니다
   - **Quit**: 앱을 종료합니다
3. "Show Details"를 선택하면 팝업 창에서 다음 정보를 확인할 수 있습니다:
   - 현재 세션 토큰 사용량 및 비용
   - 오늘의 총 사용량
   - 사용 중인 모델별 상세 정보

## 화면 구성

- **메뉴바**: `478.4k | $0.44` 형태로 토큰 수와 비용을 표시
- **상세 창**:
  - Current Session: 현재 세션의 토큰 사용량과 진행률
  - Daily Usage: 오늘의 총 사용량
  - Active Models: 사용 중인 Claude 모델들의 개별 통계

## 기술 스택

- **Electron**: 크로스 플랫폼 데스크톱 앱 프레임워크
- **ccusage**: Claude Code 사용량 분석 라이브러리
- **Node.js**: 백엔드 로직

## 개발

개발 모드에서 실행:
```bash
npm run dev
```

앱 패키징:
```bash
npm run pack    # 디렉토리로 패키징
npm run build   # DMG 파일 생성
```

## 라이선스

MIT License

## 기여

이슈나 PR을 환영합니다!

## 참고

이 앱은 [ccusage](https://github.com/ryoppippi/ccusage) 라이브러리를 사용하여 Claude Code의 사용량 데이터를 가져옵니다.