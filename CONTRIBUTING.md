# 변경과 검증

1. 공통 기능은 `src/`의 해당 모듈에서 수정합니다. `dist/`는 직접 편집하지 않습니다.
2. 학교 특이사항은 `src/schools/<id>/`에 둡니다. core에 학교 이름 조건문을 추가하지 않습니다.
3. physics vocabulary는 English로 작성합니다. UI 설명과 문서는 한국어를 사용할 수 있습니다.
4. `pnpm format`, `pnpm check`, `pnpm format:check`를 실행합니다.

## 브라우저 smoke test

- 세 학교 진입과 전환, 선택 화면 복귀 후 재진입.
- 회전·확대·위에서 보기·label·밤 모드·도움말.
- 각 도구 실행과 Undo/전체 복구, 진행 중 효과의 Undo 취소.
- Nuclear: 낙하 → flash → reveal → 파괴 장면.
- Black hole: capture → 동일 debris ejection → Shockwave.
- low → high → auto 전환, shadow 복원, 숨긴 탭의 정지.
- `dist/Campus-Playground.html` 및 단독판을 오프라인으로 실행.

Canvas의 `data-fps`, `data-render-ratio`, `data-draw-calls`, `data-settled` 등은 개발 확인용입니다. 테스트의 CPU 시간과 실제 브라우저 FPS를 같은 수치로 비교하지 마세요.

## Git

`node_modules/`, `dist/`, 로그는 제외합니다. 소스·문서·테스트·vendor 라이선스·`pnpm-lock.yaml`은 함께 관리합니다. 패키지를 바꿨으면 lockfile도 갱신하세요. `main`에 push하면 GitHub Actions가 테스트·빌드 후 GitHub Pages를 갱신합니다.
