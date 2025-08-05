# Claude Code Usage Monitor for macOS

[English README](https://github.com/centraldogma99/ccusage-system-tray/blob/main/README.en.md)

macOS 메뉴바에서 Claude Code의 토큰 사용량을 실시간으로 모니터링하는 앱입니다.

## 주요 특징

- **실시간 모니터링**: 현재 세션의 토큰 사용량을 메뉴바에 표시
- **5시간 단위 추적**: Claude의 5시간 사용량 초기화 주기에 맞춰 현재 시간대 사용량 확인
- **사용량 퍼센티지**: 설정된 최대 토큰 대비 사용률을 한눈에 파악
- **커스터마이징 가능**: 플랜에 따라 최대 사용량 설정 조정 가능

## 토큰 제한 가이드

기본값은 88,000 토큰(Max 5x 플랜 기준)으로 설정되어 있으며, 플랜에 따라 조정 가능합니다:

| 플랜    | 월 요금 | 예상 토큰 제한\* |
| ------- | ------- | ---------------- |
| Pro     | $20/월  | ~44,000 토큰     |
| Max 5x  | $100/월 | ~88,000 토큰     |
| Max 20x | $200/월 | ~220,000 토큰    |

\*참고: [출처](https://hostbor.com/claude-ai-max-plan-explained/) (비공식 추정치)

## 시스템 트레이

<img width="232" height="24" alt="스크린샷 2025-08-01 오후 5 50 28" src="https://github.com/user-attachments/assets/83f8db90-1f5b-4e19-ac10-a87255f14352" />

## 자세히 보기

<img width="401" height="600" alt="스크린샷 2025-08-01 오후 5 50 36" src="https://github.com/user-attachments/assets/832eb79b-0965-412e-a5e4-c6560949c608" />

## 설치 방법

### 사전 요구 사항: Bun 설치

이 앱은 작동하기 위해 Bun이 설치되어 있어야 합니다.

설치 방법은 [bun 문서](https://bun.com/)를 확인하세요.

또는 쉬운 설치를 위해 제공하는 [bun_install_script.sh](https://github.com/centraldogma99/ccusage-system-tray/blob/main/src/bun_install_script.sh)를 활용할 수 있습니다.

스크립트를 다운로드 한 후 다음과 같이 스크립트를 실행하세요.

```shell
sh bun_install_script.sh
```

### 방법 1: GitHub Releases에서 다운로드 (권장)

1. [Releases 페이지](https://github.com/centraldogma99/claude-usage-macos/releases)에서 최신 버전 확인
2. Apple Silicon Mac용 파일 다운로드: `Claude-Code-Usage-Monitor-x.x.x-arm64.dmg`
3. DMG 파일을 열고 앱을 Applications 폴더로 드래그

> **참고**: 현재 Apple Silicon (M1/M2/M3) Mac만 지원합니다.

### 방법 2: 소스 코드에서 빌드

프로젝트 루트에서 다음 명령어로 소스를 빌드하세요:

```bash
npm install
npm run build
```

dist 디렉토리에 생성된 DMG 파일을 열고 설치하면 끝입니다.

## 기능

- **실시간 토큰 사용량 표시**: 메뉴바에 현재 세션의 토큰 사용량과 비용을 표시
- **세부 정보 창**: 클릭하면 자세한 사용량 정보를 확인할 수 있는 창이 열림
- **자동 새로고침**: 1분마다 자동으로 사용량 데이터를 업데이트

## 설치 및 실행

1. 의존성 설치:

```bash
npm install
```

2. 개발 모드로 실행:

```bash
npm run dev
```

3. 앱 빌드 (선택사항):

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

## 참고

이 앱은 [ccusage](https://github.com/ryoppippi/ccusage) 라이브러리를 사용하여 Claude Code의 사용량 데이터를 가져옵니다.
