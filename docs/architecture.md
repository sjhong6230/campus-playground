# 구조와 데이터 흐름

## 진입과 수명주기

`scripts/build.mjs`는 학교 등록 목록을 검증하고 esbuild로 ES modules를 IIFE로 묶습니다. Three.js는 기존 렌더링 호환성을 위해 고정된 classic 배포본을 사용합니다. 게임 모듈은 `import`/`export`로 연결되며, `window.Campus*` 전역 등록이나 script 순서 의존은 없습니다. 외부 라이브러리 진입점인 `window.THREE`만 bootstrap에서 사용합니다.

통합판은 공통 게임 template 하나와 학교 metadata 목록을 내장합니다. `ui/lobby.js`가 선택된 id를 template에 넣고 iframe을 만듭니다. `main.js`는 해당 학교를 조회하고 `bindSchoolUI()`와 `createGame()`을 호출합니다. 학교 변경/선택 화면 복귀 시 이전 iframe을 제거하므로 이전 animation loop와 WebGL context를 계속 실행하지 않습니다. 같은 document 안에서 `createGame()`을 반복 호출하는 방식은 지원하지 않습니다.

## 역할

| 모듈                    | 책임                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `core/game.js`          | 공통 서비스 연결, 점수, 효과 sequence, frame 순서             |
| `core/history.js`       | 크기가 제한된 Undo stack, block state capture/restore         |
| `world/buildings.js`    | 학교 segment → fracture geometry → label/roof                 |
| `world/terrain.js`      | height query, crater/fissure/lava, texture 및 mesh 갱신       |
| `world/scenery.js`      | 나무·골대·벤치·차·코트·운동장 surface·정문·옹벽·울타리        |
| `world/site-details.js` | 학교별 정문·울타리 geometry와 도로·보행로 texture             |
| `rendering/facades.js`  | 공유 facade texture cache, picking을 유지하는 material groups |
| `physics/damage.js`     | impact 범위, structural support, damage 결과 전달             |
| `physics/support.js`    | 초기 footprint 기반 local support graph·지연된 collapse       |
| `physics/debris.js`     | gravity, velocity integration, collision, sleep               |
| `tools/actions.js`      | 사용자가 선택한 도구 시작                                     |
| `tools/*`, `effects/*`  | 진행 중인 효과, capture/ejection, draw batches                |
| `ui/controls.js`        | ray picking, pointer/touch, camera, label, keyboard           |
| `rendering/quality.js`  | 화질 저장, FPS sampling, pixel ratio, shadow 전환             |

`core/game.js`는 학교 id에 따른 조건 분기를 하지 않습니다. 학교가 달라지는 부분은 `createLayout()`과 `paintGround()`로 전달합니다. core에는 여전히 여러 효과의 시간 순서를 연결하는 로직이 있으므로, 새로운 장시간 효과를 추가할 때 이 lifecycle 연결은 필요합니다.

## 상태와 Undo

Block은 원래 위치 `origin`, 현재 위치 `p`, velocity `v`, rotation `r`, angular velocity `spin`, active/sleep/capture 상태와 `collapse`, `contactTime`을 가집니다. GPU mesh는 이 상태의 표현이며 Undo snapshot에는 넣지 않습니다. Support graph는 고정 geometry에서 만들고, Undo 후 active flags 변화를 감지하여 다시 평가합니다.

동작 시작 직전에 score, hits, blocks, terrain, scenery, fire, volcano cooling 상태를 저장합니다. Undo는 진행 중인 효과를 취소한 뒤 snapshot을 복원합니다. 최대 16개 기록만 보관합니다. 최고 점수는 Undo로 낮아지지 않습니다.

Black hole은 원래 debris 참조를 capture했다가 동일 객체를 eject합니다. 이를 새 객체로 바꾸면 Undo와 환경 요소 참조가 어긋날 수 있습니다.

## 성능

- terrain 명령은 변경을 모아 frame당 `flush()` 한 번으로 반영합니다.
- burn-only 변경은 height와 normals를 다시 계산하지 않습니다.
- fracture batch는 변하지 않은 fragment를 건너뛰고 변경 범위만 upload합니다.
- facade는 geometry와 face ownership을 유지한 material groups로 적용하며, 같은 palette의 procedural texture를 공유합니다. Roof·유리 부착물도 가까운 fragment를 따라 움직이고 변경된 instance만 upload합니다.
- support graph는 active flags가 같으면 전파를 건너뜁니다. Debris contact는 spatial grid와 고정 크기 rubble height grid를 사용하고, 모두 sleep이면 contact 계산도 쉽니다.
- scenery와 fire는 instance batch를 사용하며 emitter/particle 수에 제한이 있습니다.
- shadow는 dirty 상태일 때 제한된 주기로 갱신합니다.
- 숨겨진 document는 simulation을 진행하지 않습니다.
- 기본 모드에서 FPS에 따라 pixel ratio를 조절하며, low 모드는 shadow를 끕니다.

## 좌표와 근사

공통 terrain은 X 151 × Z 118 game units입니다. 북쪽은 `-Z`, 동쪽은 `+X`, 위쪽은 `+Y`입니다. 회전은 radians, 기본 story 높이는 3 game units입니다. 이는 실제 건물의 engineering 수치가 아닙니다. 새 학교도 이 범위 안으로 스케일링하세요. terrain 범위 자체를 바꾸려면 picking, tool 범위, scenery UV와 debris boundary도 함께 바꿔야 합니다.

Building pad와 운동장은 평탄하게 유지하고 주변 terrain과 blend합니다. 선택적 `tennis.height`도 별도의 평탄한 pad를 만듭니다. 측량자료가 없는 높이는 단차의 방향과 배치 관계를 표현하는 근사입니다. 사진의 관측 사실, 자료 연도, 추정한 치수는 `docs/sources`에 구분합니다.

Support graph는 slab·column·wall과 bridge endpoint의 가까운 footprint를 연결합니다. Support가 부족한 부분은 지연 후 gravity로 내려앉고, 직접 impact는 거리와 mass에 따라 velocity가 달라집니다. Debris는 substeps에서 oriented bounds로 지면·살아 있는 slab·settled rubble와 contact하고 friction과 restitution으로 energy를 줄입니다. Moving-body all-pairs solver나 실제 재료·응력 해석은 포함하지 않습니다. Nuclear whiteout 중에도 동일 simulation을 실행하며 강제 teleport/sleep하지 않습니다.
