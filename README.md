# Campus Playground

서울과학고등학교·경기과학고등학교·인천과학고등학교 모형을 탐색하고 파괴하는 Three.js 샌드박스입니다. 학교와 관계없는 비공식 게임이며, 공개 지도에 기반한 건물 배치와 치수·외관은 근사입니다.

## 실행

개발에는 **Node.js 22 이상**과 **pnpm 11**이 필요합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

브라우저에서 <http://127.0.0.1:4173>을 여세요. 소스 변경 시 자동으로 다시 빌드되며, 브라우저를 새로고침하면 적용됩니다. 종료는 `Ctrl+C`입니다. 다른 포트는 `PORT` 환경변수로 지정합니다.

```sh
pnpm test          # 모델·도구·Undo·배포 파일 검증
pnpm build         # 오프라인 HTML 생성
pnpm check         # 테스트 후 빌드
pnpm format        # 소스/문서 포맷
pnpm format:check  # 포맷 검사
pnpm start         # 이미 빌드한 dist/ 미리보기
```

빌드 결과는 `dist/`에 생깁니다.

| 파일                     | 용도                    |
| ------------------------ | ----------------------- |
| `index.html`             | GitHub Pages 시작 화면  |
| `Campus-Playground.html` | 학교를 선택하는 통합판  |
| `SSHS-Playground.html`   | 서울과고 단독판         |
| `GSHS-Playground.html`   | 경기과고 단독판         |
| `ISHS-Playground.html`   | 인천과고 단독판         |
| `build-info.json`        | 포함된 학교와 파일 크기 |

HTML은 다운로드 후 더블클릭으로 실행할 수 있습니다. 실행 시 인터넷이나 Node.js가 필요하지 않습니다. 개발용 소스 HTML은 직접 열지 말고 `pnpm dev`를 사용하세요. 브라우저의 WebGL 지원이 필요합니다.

## 구조

```text
src/
  main.js                 학교 선택 → UI 연결 → 공통 게임 시작
  core/                   게임 수명주기·frame loop·Undo·공유 설정
  physics/                fracture·damage·debris integration
  world/                  건물 생성·terrain 변형·파괴 가능한 환경 요소
  rendering/              표면 재질·roof 부착물·자동 화질
  effects/                fire·mushroom cloud·Shockwave·공통 시각 효과
  tools/                  도구 catalog·시작 action·지속 효과
  audio/                  impact audio
  ui/                     게임/선택 화면·입력·camera·학교별 문구 연결
  styles/                 공통 스타일
  schools/
    index.js              학교 등록 목록
    validate.js           빌드 시 데이터 검증
    sshs/                 서울과고: index.js / layout.js / ground.js
    gshs/                 경기과고: index.js / layout.js / ground.js
    ishs/                 인천과고: index.js / layout.js / ground.js
scripts/                  빌드·개발 감시·로컬 서버
tests/                    Node test runner + 이전 버전 비교 fixture
docs/                     설계·확장 가이드·출처
vendor/                   고정된 Three.js 배포본과 MIT 라이선스
```

학교마다 게임 코드를 복사하지 않습니다. 학교 폴더는 소개 정보, layout factory, ground painter만 제공합니다. 선택 화면과 단독 배포 파일은 등록 목록에서 자동 생성됩니다. 통합 HTML에도 공통 엔진을 한 번만 저장하고, 선택한 학교의 iframe 하나만 실행합니다.

## 확장

- [학교 추가 가이드](docs/adding-school.md): 새 학교 폴더를 만들고 `src/schools/index.js`에 등록합니다.
- [도구 추가 가이드](docs/adding-tool.md): catalog와 action을 추가하고 필요한 효과 lifecycle을 연결합니다.
- [설계와 상태 관리](docs/architecture.md): 모듈 경계, Undo, 성능 처리, 배포 방식.
- [기여 및 검증](CONTRIBUTING.md): 변경 전후 확인할 사항.

## 조작

클릭으로 도구를 사용하고, 드래그로 회전하며, 휠 또는 두 손가락으로 확대합니다. `1–6`은 도구 선택, `Ctrl+Z`/`Cmd+Z`는 Undo, `R`은 전체 복구입니다. 오른쪽 위 화질을 `자동`·`가벼움`·`고화질` 중 선택할 수 있습니다.

기본 화질은 자동입니다. 느린 컴퓨터에서는 `가벼움`을 사용하세요. 최고 점수는 학교별로, 화질은 공통으로 localStorage에 저장됩니다. 학교 전환 시 진행 중인 장면과 Undo 기록은 초기화됩니다.

## 검증 범위

자동 테스트는 세 학교의 초기 terrain·환경 요소가 리팩터링 이전과 같은지 확인합니다. 파괴와 복구, roof 부착물, idle 상태의 불필요한 GPU upload 방지, Black hole capture/ejection, Shockwave, 융단 폭격 취소, 화산폭발 및 fire 제한도 검사합니다. 배포 파일의 offline 의존성과 JavaScript 구문도 검증합니다.

자동 테스트는 Node에서 WebGL 없이 실행하므로 화면 품질·FPS를 보장하지 않습니다. UI와 실제 렌더링은 브라우저에서 함께 확인해야 합니다. 기능별 smoke test는 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 출처와 라이선스

학교별 참고 자료와 근사 범위는 [docs/sources](docs/sources)에 기록했습니다. 위성사진 원본은 게임에 포함하지 않습니다. 디자인의 출발점은 [SMASH](https://hong-iron.github.io/SMASH/)입니다. Three.js는 `vendor/THREE-LICENSE.txt`의 MIT 라이선스를 따릅니다. 자세한 내용은 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 보세요.

이 디렉터리가 독립적인 Git 저장소입니다. 생성물 `dist/`와 의존성 `node_modules/`는 버전 관리에서 제외합니다.

## GitHub Pages 배포

`.github/workflows/pages.yml`은 `main`에 push할 때 테스트와 빌드를 실행하고, 성공한 `dist/`를 GitHub Pages에 배포합니다. Actions 탭의 **Deploy GitHub Pages → Run workflow**로 수동 배포할 수도 있습니다.

새 저장소로 복사했다면 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정하세요. 개인 토큰을 workflow secret에 추가할 필요는 없습니다. 배포 job은 GitHub가 제공하는 임시 인증을 사용합니다.

배포 주소의 루트에서는 학교 선택 화면이 열립니다. 같은 경로의 `SSHS-Playground.html`, `GSHS-Playground.html`, `ISHS-Playground.html`로 각 학교에 바로 접속할 수 있습니다. HTML 안에 필요한 코드가 들어 있어 프로젝트 경로가 달라도 별도의 base URL 설정이 필요하지 않습니다.
