# 릴리스 가이드

## 새 버전 릴리스 방법

### 1. 버전 업데이트
```bash
# package.json의 version 필드 업데이트
npm version patch  # 패치 버전 (1.0.0 -> 1.0.1)
npm version minor  # 마이너 버전 (1.0.0 -> 1.1.0)
npm version major  # 메이저 버전 (1.0.0 -> 2.0.0)
```

### 2. 태그 생성 및 푸시
```bash
git push origin main
git push origin --tags
```

### 3. 자동 빌드 및 릴리스
- 태그가 푸시되면 GitHub Actions가 자동으로 실행됩니다
- 빌드가 완료되면 draft 릴리스가 생성됩니다
- [Releases 페이지](https://github.com/centraldogma99/claude-usage-macos/releases)에서 draft 확인

### 4. 릴리스 발행
1. GitHub Releases 페이지에서 draft 릴리스 확인
2. 릴리스 노트 작성
3. "Publish release" 버튼 클릭

## GitHub Token 설정 (선택사항)

더 많은 권한이 필요한 경우 Personal Access Token을 설정할 수 있습니다:

1. [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens/new)
2. "repo" 권한 선택
3. 생성된 토큰을 복사
4. Repository Settings > Secrets > Actions에서 `GH_TOKEN` 추가

## 빌드 아티팩트

릴리스 시 다음 파일이 자동으로 생성됩니다:
- `Claude-Code-Usage-Monitor-{version}-arm64.dmg` - Apple Silicon용 DMG

> **참고**: 현재 Apple Silicon (M1/M2/M3) Mac만 지원합니다.