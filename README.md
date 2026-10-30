# Campus Playground

영재학교 8곳·과학고 10곳·자율형 사립고 2곳, 총 20개 학교의 모형을 탐색하고 파괴하는 Three.js 샌드박스입니다. 공개 지도, 학교 배치도·시설 사진, 항공사진과 사용자 제공 모형을 참고합니다. 학교와 관계없는 비공식 게임이며, 배치와 치수·외관은 근사입니다.

선택 화면과 게임 안 학교 전환 메뉴를 학교 유형별로 구분합니다. 외대부고와 선덕고는 자율형 사립고로 표시합니다. 부산과학고(금정구)는 한국과학영재학교·부산일과학고와 별개의 캠퍼스입니다. 새로 추가한 대전동신과고·부산과고·창원과고·제주과고·외대부고·선덕고의 참고 자료와 미확인 범위는 `docs/sources/`에 기록했습니다.

**[웹에서 플레이](https://sjhong6230.github.io/campus-playground/)** · [GitHub 저장소](https://github.com/sjhong6230/campus-playground)

학교·교육청과 제휴·후원 관계가 없는 비공식 무료 창작물입니다. 실제 사람이 없는 모형을 다루며 현실의 위협·시설 훼손을 권장하지 않습니다. 게임 내 **안내 · 개인정보 · 권리 문의**에서 운영 방식, 브라우저 저장 정보, 호스팅의 접속 기록, 자료·라이선스 및 공개 문의 창구를 확인할 수 있습니다. 법률 검토의 전제와 미확인 사항은 [공개 운영 검토 기록](docs/legal-review.md)에 남겼습니다.

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

| 파일                      | 용도                        |
| ------------------------- | --------------------------- |
| `index.html`              | GitHub Pages 시작 화면      |
| `Campus-Playground.html`  | 학교를 선택하는 통합판      |
| `SSHS-Playground.html`    | 서울과고 단독판             |
| `GSHS-Playground.html`    | 경기과고 단독판             |
| `ISHS-Playground.html`    | 인천과고 단독판             |
| `KSA-Playground.html`     | 한국과학영재학교 단독판     |
| `GSA-Playground.html`     | 광주과고 단독판             |
| `DGSHS-Playground.html`   | 대구과고 단독판             |
| `DJSHS-Playground.html`   | 대전과고 단독판             |
| `HSSH-Playground.html`    | 한성과고 단독판             |
| `SJSHS-Playground.html`   | 세종과고 단독판             |
| `BSIS-Playground.html`    | 부산일과고 단독판           |
| `GBS-Playground.html`     | 경기북과고 단독판           |
| `IASA-Playground.html`    | 인천과학예술영재학교 단독판 |
| `KBSH-Playground.html`    | 경북과고 단독판             |
| `SASA-Playground.html`    | 세종과학예술영재학교 단독판 |
| `DDSHS-Playground.html`   | 대전동신과학고 단독판       |
| `BSSH-Playground.html`    | 부산과학고 단독판           |
| `CSHS-Playground.html`    | 창원과학고 단독판           |
| `JSHS-Playground.html`    | 제주과학고 단독판           |
| `HAFS-Playground.html`    | 외대부고 단독판             |
| `SUNDUCK-Playground.html` | 선덕고 단독판               |
| `build-info.json`         | 포함된 학교와 파일 크기     |

HTML은 다운로드 후 더블클릭으로 실행할 수 있습니다. 실행 시 인터넷이나 Node.js가 필요하지 않습니다. 개발용 소스 HTML은 직접 열지 말고 `pnpm dev`를 사용하세요. 브라우저의 WebGL 지원이 필요합니다.

## 구조

```text
src/
  main.js                 학교 선택 → UI 연결 → 공통 게임 시작
  core/                   게임 수명주기·frame loop·Undo·공유 설정
  physics/                fracture·support graph·damage·debris contact
  world/                  건물 생성·terrain 변형·파괴 가능한 환경 요소
  rendering/              학교별 facade·roof 부착물·자동 화질
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
    ksa/                  한국과학영재학교: index.js / layout.js / ground.js
    gsa/                  광주과고: index.js / layout.js / ground.js
    dgshs/                대구과고: index.js / layout.js / ground.js
    djshs/                대전과고: index.js / layout.js / ground.js
    hssh/                 한성과고: index.js / layout.js / ground.js
    sjshs/                세종과고: index.js / layout.js / ground.js
    bsis/                 부산일과고: index.js / layout.js / ground.js
    gbs/                  경기북과고: index.js / layout.js / ground.js
    iasa/                 인천과학예술영재학교: index.js / layout.js / ground.js
    kbsh/                 경북과고 지곡 캠퍼스
    sasa/                 세종과학예술영재학교
    ddshs/                대전동신과학고
    bssh/                 부산과학고 (금정구)
    cshs/                 창원과학고
    hafs/                 외대부고 (자율형 사립고)
    sunduck/              선덕고 (자율형 사립고)
    jshs/                 제주과학고
    categories.js         선택 화면/학교 전환 메뉴의 학교 유형
    shared/               선택적 배치·단차·ground drawing 도우미
scripts/                  빌드·개발 감시·로컬 서버
tests/                    Node test runner + 역사적 비교 fixture
docs/                     설계·확장 가이드·출처
vendor/                   고정된 Three.js 배포본과 MIT 라이선스
```

학교마다 게임 코드를 복사하지 않습니다. 학교 폴더는 소개 정보, layout factory, ground painter와 `details.js`의 외관·정문·동선 데이터를 제공합니다. 선택 화면과 단독 배포 파일은 등록 목록에서 자동 생성됩니다. 통합 HTML에도 공통 엔진을 한 번만 저장하고, 선택한 학교의 iframe 하나만 실행합니다.

## 확장

- [학교 추가 가이드](docs/adding-school.md): 새 학교 폴더를 만들고 `src/schools/index.js`에 등록합니다.
- [도구 추가 가이드](docs/adding-tool.md): catalog와 action을 추가하고 필요한 효과 lifecycle을 연결합니다.
- [설계와 상태 관리](docs/architecture.md): 모듈 경계, Undo, 성능 처리, 배포 방식.
- [기여 및 검증](CONTRIBUTING.md): 변경 전후 확인할 사항.

## 조작

클릭으로 도구를 사용하고, 드래그로 회전하며, 휠 또는 두 손가락으로 확대합니다. `1–6`은 도구 선택, `Ctrl+Z`/`Cmd+Z`는 Undo, `R`은 전체 복구입니다. 오른쪽 위 화질을 `자동`·`가벼움`·`고화질` 중 선택할 수 있습니다.

기본 화질은 자동입니다. 화면 크기에 따라 렌더링 픽셀 수를 제한하고 FPS가 떨어지면 해상도를 낮춥니다. UI 글자 크기는 유지합니다. 75·120·144·165Hz 화면에서도 잔여 시간을 보존해 60 FPS를 목표로 처리합니다. `가벼움`은 30 FPS와 그림자 끄기를 사용합니다. 최고 점수는 학교별로, 화질은 공통으로 localStorage에 저장됩니다. 학교 전환 시 진행 중인 장면과 Undo 기록은 초기화됩니다.

블랙홀은 4.6초 동안 영향 범위를 넓히며 구조물을 뜯어냅니다. Debris는 mass에 따라 다르게 회전하고 orbit하다가 중심부에서 tidal stretch와 함께 capture되며, 마지막에는 원래 잔해가 다시 eject되고 Shockwave가 퍼집니다. 화면 흔들림은 reduced-motion 설정을 따르며 진행 중에도 Undo와 전체 복구가 가능합니다.

## 검증 범위

자동 테스트는 모든 등록 학교의 terrain 재현성, building pad·운동장 높이, 파괴와 복구를 검사합니다. 광주과고의 낮은 운동장과 층별 연결통로, 정문·옹벽·울타리의 Undo, facade의 picking, roof·유리 부착물도 확인합니다. Support failure의 국소 전파, bridge support, oriented contact, rubble accumulation, frame rate별 motion, idle GPU upload 방지, Black hole capture/ejection, Shockwave, 단일 폭탄 투하·취소, 화산폭발 및 fire 제한을 검사합니다. 배포 파일의 offline 의존성과 JavaScript 구문도 검증합니다. 기존 모형의 hash fixture는 역사적 참고용이며 현실 배치 수정의 기준으로 사용하지 않습니다.

외벽은 학교별 brick·stone·panel·render 질감, 창틀과 층별 band를 사용합니다. 확인된 유리 계단실·옥상 canopy·dome, 운동장 단차, 정문과 차단기, 옹벽·울타리·보행로·차도는 학교별 데이터로 정의합니다. 위성사진이나 건축 사진 원본을 texture로 넣지 않아 통합 HTML은 offline으로 실행됩니다.

파괴는 가까운 column·slab의 support graph를 따라 지연되어 전파됩니다. Impact falloff와 fragment mass를 적용하고, debris는 gravity·friction·낮은 restitution을 거쳐 지면, 남은 slab, 이미 멈춘 rubble 위에 쌓입니다. 핵폭탄의 whiteout 중에도 simulation이 계속되므로 reveal 시 잔해를 바닥으로 순간 이동시키지 않습니다. 실시간 게임용 근사이며 FEA, 실제 구조 안전 평가, 움직이는 모든 fragment 사이의 rigid-body collision을 구현한 것은 아닙니다.

폭탄은 클릭당 한 발입니다. Black hole은 약 3.2초 동안 주변을 흡수한 뒤 debris를 방출합니다. 최대 capture radius는 `24 × √POWER`, Shockwave radius는 `32 × √POWER` world units입니다. 도구별 사운드는 외부 파일 없이 합성하고 버퍼를 재사용하며, 소리는 오른쪽 버튼으로 켤 수 있습니다.

Black hole의 시각 효과는 `effects/blackhole-visual.js`에서 분리해 관리합니다. Photon ring, 밝기가 비대칭인 Accretion disk, stylized lensing arc와 spiral trail을 4 draw calls로 표현합니다. 전체 화면 후처리나 실제 relativistic ray tracing은 사용하지 않습니다.

자동 화질은 FPS가 낮을 때 해상도와 particle 밀도를 함께 줄입니다. scenery는 변경된 instance만 GPU에 보내고, camera가 정지해 있으면 label 위치를 다시 계산하지 않습니다. 장면이 정지하면 3D 재렌더링을 쉬고, camera 입력·복구·효과 발생 시 다시 그립니다. 낮은 화질에서는 fire·smoke 수와 그림자 갱신도 줄입니다.

자동 테스트는 Node에서 WebGL 없이 실행하므로 화면 품질·FPS를 보장하지 않습니다. UI와 실제 렌더링은 브라우저에서 함께 확인해야 합니다. 기능별 smoke test는 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 출처와 라이선스

학교별 참고 자료와 근사 범위는 [docs/sources](docs/sources)에 기록했습니다. 위성사진 원본은 게임에 포함하지 않습니다. 디자인의 출발점은 [SMASH](https://hong-iron.github.io/SMASH/)입니다. Three.js는 `vendor/THREE-LICENSE.txt`의 MIT 라이선스를 따릅니다. 자세한 내용은 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 보세요.

이 디렉터리가 독립적인 Git 저장소입니다. 생성물 `dist/`와 의존성 `node_modules/`는 버전 관리에서 제외합니다.

## GitHub Pages 배포

`.github/workflows/pages.yml`은 `main`에 push할 때 테스트와 빌드를 실행하고, 성공한 `dist/`를 GitHub Pages에 배포합니다. Actions 탭의 **Deploy GitHub Pages → Run workflow**로 수동 배포할 수도 있습니다.

새 저장소로 복사했다면 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정하세요. 개인 토큰을 workflow secret에 추가할 필요는 없습니다. 배포 job은 GitHub가 제공하는 임시 인증을 사용합니다.

배포 주소의 루트에서는 학교 선택 화면이 열립니다. 위 파일 표의 학교별 HTML 경로로 각 학교에 바로 접속할 수도 있습니다. HTML 안에 필요한 코드가 들어 있어 프로젝트 경로가 달라도 별도의 base URL 설정이 필요하지 않습니다.
