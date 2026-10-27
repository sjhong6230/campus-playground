# 도구와 효과 추가

## UI와 시작 동작

1. `src/tools/catalog.js`에 고유 id, key, label, icon, description, help를 추가합니다. 도구 버튼·도움말·단축키가 여기서 생성됩니다.
2. `src/tools/actions.js`의 반환 객체에 같은 id의 handler를 추가합니다. Handler는 world 위치 `p`를 받습니다. 현재 POWER는 `getPower()`로 읽습니다.
3. 필요하면 `physics/damage.js`에 damage mode를 추가합니다. 새 mode의 radius, terrain 변화, scenery damage와 점수 정책을 함께 정의하세요.

```js
// catalog.js 예시
{ id: 'newtool', key: '7', label: '새 도구', icon: '✦',
  description: '새 도구 · 지점을 선택하세요', help: '도구 설명' }

// actions.js 예시: 이미 존재하는 impact mode를 재사용하는 즉시 동작
newtool(p) { impact(p, 'meteor', getPower()); }
```

이 예시는 Meteor의 즉시 impact를 재사용합니다. 새 시각 효과나 damage 방식을 저절로 생성하지는 않습니다. `core/game.js`는 시작할 때 catalog와 action id의 대응을 확인합니다.

## 시간이 걸리는 효과

`tools/bombing.js`, `tools/volcano.js`처럼 생성 함수에 Three.js, world, terrain, callback을 전달하세요. 권장 API는 다음과 같습니다.

```js
const effect = createEffect(T, world, terrain, onImpact);
effect.start(point, power);
effect.update(dt);
effect.active();
effect.clear();
```

`core/game.js`에서 인스턴스를 만들고 frame loop에 `update()`를 연결합니다. `fire()`의 busy 검사와 `clearEffects()` 취소 경로에도 등록하세요. `actions.js`에 이 인스턴스를 주입하면 학교별 수정 없이 사용할 수 있습니다. 지속되는 결과가 Undo 대상이면 snapshot/restore도 연결합니다.

## 동작 규칙

- POWER는 시작 시 복사해 이후 slider 변경에 영향을 받지 않게 합니다.
- start → update → finish와 중간 clear 모두 GPU resource를 정리해야 합니다.
- Undo 중 clear는 미처 발생하지 않은 impact나 finish Shockwave를 실행하면 안 됩니다.
- 점수 변경은 damage callback으로 전달하고 DOM 변경은 가능한 한 UI/core에서 합니다.
- physics 상태는 world coordinates로 유지하고 화면 흔들림 offset을 합치지 않습니다.
- emitter·particle·debris 수를 제한하고 가능하면 instance batches를 사용합니다.

테스트에는 정상 완료뿐 아니라 시작 직후 취소, 일부 impact 후 취소, POWER 유지, boundary, snapshot 복구를 포함하세요. `tests/bombing.test.mjs`가 참고 예입니다.
