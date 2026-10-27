/** UI and keyboard metadata. Add the matching action in actions.js. */
export const tools = [
  {
    id: "bombing",
    key: "1",
    label: "폭탄",
    icon: "◆",
    description: "폭탄 · 선택한 지점에 한 발 투하",
    help: "한 발이 떨어져 주변에 Explosion, crater와 화재를 남깁니다.",
  },
  {
    id: "meteor",
    key: "2",
    label: "Meteor",
    icon: "☄",
    description: "Meteor · 하늘에서 큰 돌 떨어뜨리기",
    help: "낙하 후 지면에 crater가 남습니다.",
  },
  {
    id: "volcano",
    key: "3",
    label: "화산폭발",
    icon: "♨",
    description: "화산폭발 · 용암과 화산탄으로 주변을 뒤덮기",
    hint: "분화할 지점을 선택하세요",
    help: "분화구에서 lava가 흐르고 volcanic bomb이 주변을 파괴합니다.",
  },
  {
    id: "blackhole",
    key: "4",
    label: "블랙홀",
    icon: "◎",
    description: "블랙홀 · 주변 구조물을 끌어당겨 집어삼키기",
    help: "좁은 범위의 debris를 흡수하고 약 3초 뒤 Shockwave와 함께 방출합니다.",
  },
  {
    id: "quake",
    key: "5",
    label: "Earthquake",
    icon: "ϟ",
    description: "Earthquake · 지면을 가르고 무너뜨리기",
    help: "지면에 fissure를 만들고 건물을 무너뜨립니다.",
  },
  {
    id: "nuke",
    key: "6",
    label: "핵폭탄",
    icon: "☢",
    description: "핵폭탄 · 캠퍼스 전체 날려버리기",
    help: "낙하 후 flash, Shockwave, mushroom cloud와 화재가 이어집니다.",
  },
];
export const toolById = Object.fromEntries(
  tools.map((tool) => [tool.id, tool]),
);
