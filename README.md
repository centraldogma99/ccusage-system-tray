# Claude Code Usage Monitor for macOS

Claude Code의 토큰 사용량을 macOS 메뉴바에 실시간으로 표시하는 앱입니다.

5시간마다 Claude 사용량이 초기화되는데, 현재 시간 단위(예: 14시 ~ 19시)에 얼마나 사용했는지를 간편하게 확인할 수 있습니다.

퍼센티지를 표기하기 위한 최대 사용량의 기본값은 88,000 토큰(MAX x5 플랜 기준)이며 직접 수정할 수 있습니다.

[이 블로그](https://hostbor.com/claude-ai-max-plan-explained/)에 따르면 토큰 제한은 이렇다는데 믿거나 말거나 입니다.
- Pro 플랜: 약 44,000 토큰
- Max 5x Pro ($100/월): 약 88,000 토큰
- Max 20x Pro ($200/월): 약 220,000 토큰

## 시스템 트레이
<img width="232" height="24" alt="스크린샷 2025-08-01 오후 5 50 28" src="https://github.com/user-attachments/assets/83f8db90-1f5b-4e19-ac10-a87255f14352" />


## 자세히 보기
<img width="401" height="600" alt="스크린샷 2025-08-01 오후 5 50 36" src="https://github.com/user-attachments/assets/832eb79b-0965-412e-a5e4-c6560949c608" />

## 빌드 및 설치
프로젝트 루트에서 다음 명령어로 소스를 빌드하세요:
```bash
npm run build
```

dist 디렉토리에 생성된 `Claude Code Usage Monitor-x.x.x-arm64.dmg` 파일을 열고 설치하면 끝입니다.


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
   - 사용 중인 모델별 상세 정보

## 참고

이 앱은 [ccusage](https://github.com/ryoppippi/ccusage) 라이브러리를 사용하여 Claude Code의 사용량 데이터를 가져옵니다.
