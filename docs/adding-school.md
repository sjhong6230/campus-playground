# 학교 추가

## 1. 학교 adapter 만들기

가까운 형태의 기존 학교 폴더를 `src/schools/new-school/`로 복사합니다. 공통 엔진·도구·CSS는 복사하지 않습니다. 최소 파일은 다음 세 개입니다.

- `index.js`: metadata와 두 factory의 export
- `layout.js`: 건물·부지·환경 요소를 반환하는 `createLayout()`
- `ground.js`: 도로·운동장·조경을 그리는 `paintGround()`

```js
import { createLayout } from "./layout.js";
import { paintGround } from "./ground.js";

export default {
  id: "new-school",
  name: "새 과학고등학교",
  shortName: "새 과고",
  nickname: "새 과고",
  abbr: "NSHS",
  location: "CITY · KOREA",
  eyebrow: "NEW SCIENCE HIGH SCHOOL",
  accent: "#467666",
  createLayout,
  paintGround,
};
```

id는 소문자로 시작하는 영문·숫자·하이픈으로 구성하고 중복을 피하세요. id는 저장 키와 단독 배포 파일 이름에 사용하므로 출시 후 변경하면 이전 최고 점수와 분리됩니다.

## 2. Layout 계약

`createLayout()`은 호출마다 **새 객체**를 반환해야 합니다. 기존 학교가 가진 `point(frame,u,v)`와 segment의 `sin`/`cos` cache 준비 코드를 유지하세요.

| 필드                  | 설명                                                                                |
| --------------------- | ----------------------------------------------------------------------------------- |
| `buildings[]`         | name, x, z, floors, baseY, color, segments                                          |
| `segments[]`          | x, z, w, d, angle; 선택적으로 floors, roof, roofColor, observatory, openGroundFloor |
| `links[]`             | 연결통로; x, z, w, d, angle, baseY, floors(기본 1), bottomSlab(기본 false)          |
| `field`               | 운동장 x, z, w, d, angle                                                            |
| `gate`                | 출입구 x, z, angle                                                                  |
| `benches[]`           | `[x,z]` 목록                                                                        |
| `trees`               | `[x,z]` 목록 또는 seeded random을 받는 함수                                         |
| `maxTrees`            | 선택적 제한, 기본 80                                                                |
| `hills[]`             | 주변 hill 위치 `[x,z]`                                                              |
| `parking`             | 선택적 주차장 frame; 있으면 차량 생성                                               |
| `tennis`, `courtKind` | 선택적 court frame과 `tennis` 또는 `basketball` 종류                                |
| `observatory`         | 선택적 dome: x, z, y, building index                                                |
| `sources`             | 참고 map·facilities·diagram URL과 확인 날짜                                         |
| `elevationAt(x,z)`    | 변형 전 base height                                                                 |
| `point(frame,u,v)`    | 회전된 지역 좌표 → world X/Z                                                        |

Roof는 `flat`, `gable`, `barrel`, `hip`을 지원합니다. `flat`은 `roofColor`로 칠한 평지붕이며, 다른 roof와 같이 아래 slab의 움직임·손상·복구를 따릅니다. Segment의 `color`로 건물 기본 색을 덮어쓸 수 있습니다. Hip roof는 현재 정사각형 segment에 맞춘 근사입니다. Segment의 `observatory: true`는 slab에 부착되는 작은 아치형 관측실입니다. Layout의 `observatory`는 별도의 dome 방식이므로 구분하세요.

`baseY`가 해당 footprint의 `elevationAt()` 값과 맞도록 평탄화하세요. 운동장과 건물이 겹치지 않도록 확인하고, 높이나 명칭이 불확실한 부분은 출처 문서에 근사라고 기록하세요.

`openGroundFloor: true`는 첫 층의 wall을 생성하지 않고 column과 위쪽 slab을 유지합니다. 일부만 열린 1층은 footprint를 열린 segment와 닫힌 segment로 나누어 표현하세요. 연결다리는 층간 높이 3 기준으로 `baseY = 건물 baseY + (시작층 - 1) * 3`, `floors = 끝층 - 시작층 + 1`로 지정합니다. `bottomSlab: true`는 공중에 있는 연결다리의 바닥 deck도 생성합니다. 연결다리의 각 층은 damage와 Undo에 포함됩니다.

## 3. Ground painter

`paintGround({ctx,c,W,D,X,Z,rect,path,fieldPath,layout})`는 초기 2D ground texture를 그립니다. `rect`는 world 단위 사각형, `path`는 world 좌표 경로, `fieldPath`는 회전된 운동장 내부 좌표입니다. 기존 학교의 `ground.js`에서 도로·주차장·운동장 색과 선을 바꾸면 됩니다. crater/fissure/burn 처리는 공통 terrain 모듈이 담당합니다.

## 4. 등록과 검증

`src/schools/index.js`에서 import하고 `schools` 배열에 추가합니다. 선택 카드·선택 메뉴·제목·단독 HTML 파일은 자동으로 생성됩니다.

```js
import newSchool from "./new-school/index.js";
export const schools = [sshs, gshs, ishs, newSchool];
```

`docs/sources/new-school.txt`에 참고 자료와 근사 범위를 남기세요. 등록한 학교는 공통 damage·Undo·성능 테스트에 자동 포함됩니다. 별도로 초기 상태를 고정하고 싶다면 `tests/fixtures/legacy-campuses.json`에 기준 fixture를 추가하세요. 기존 세 학교의 fixture를 새 코드 결과에 맞춰 무조건 덮어쓰면 regression을 놓칠 수 있습니다.

`pnpm check` 후 위에서 보기, building label, 파괴, Undo, 전체 복구, 다른 학교로 전환을 확인하세요. 등록만 하면 배포 파일은 자동 생성되지만, 실제 배치 정확도는 지도와 직접 대조해야 합니다.

## 선택적 공통 도우미

`shared/layout.js`의 `segment`, `building`, `bridge`, `point`, `local`을 이용하면 새 학교의 geometry 작성이 간단해집니다. `finishLayout(layout, backgroundHeight)`는 건물 footprint를 `baseY`로, 운동장을 선택적 `field.height`(기본 1.5)로 평탄화하고 주변 4 world units를 보간합니다. 건물과 운동장 footprint가 겹치지 않도록 배치하세요. 기존 학교의 `elevationAt`을 강제로 바꾸지는 않습니다.

`shared/ground.js`의 `paintSite(args, site)`는 학교별 `surfaces`, `paths`, `steps`로 ground texture를 그립니다. 각 학교의 `ground.js`에서 별도의 도로·보행로·색을 지정하고, 필요하면 custom painter를 사용하세요. 새 학교 예시는 `dgshs`, `djshs`, `hshs`에 있습니다. DGSHS와 DJSHS는 파일명 충돌을 피하기 위한 게임 식별자입니다.
