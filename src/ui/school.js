import { tools } from "../tools/catalog.js";

export function bindSchoolUI(school) {
  const $ = (selector) => document.querySelector(selector);
  document.title = school.shortName + " 비공식 모형 · CAMPUS PLAYGROUND";
  $('meta[name="description"]').content =
    school.name +
    "에서 모티브를 얻은 비공식 모형 샌드박스. 학교와 제휴·후원 관계가 없는 무료 창작물입니다.";
  $("#scene").setAttribute(
    "aria-label",
    school.name +
      " 모형. 건물, 나무, 운동장, 시설물을 누르면 선택한 도구가 작동합니다.",
  );
  $(".brand").setAttribute("aria-label", "Campus Playground · 비공식 모형");
  $(".brand-icon").firstChild.textContent = "◇";
  $(".brand > span:last-child").firstChild.textContent = "CAMPUS";
  $(".campus-tag").replaceChildren();
  const dot = document.createElement("span");
  dot.className = "live-dot";
  $(".campus-tag").append(
    dot,
    school.name + " · " + school.abbr + " / 비공식 모형",
  );
  $(".intro .eyebrow").textContent = school.eyebrow;
  const title = $(".intro h1");
  title.replaceChildren(
    "오늘은,",
    document.createElement("br"),
    school.nickname + " 모형을 ",
  );
  const accent = document.createElement("span");
  accent.textContent = "부숴보자.";
  title.append(accent);
  const help = $("#help-dialog .small");
  help.replaceChildren(
    "공개 지도와 학교 시설 자료를 참고한 비공식 모형입니다. 치수·높이·외관과 조경은 게임용 근사입니다. ",
  );
  const sources = school.createLayout().sources;
  for (const [label, url] of [
    ["참고 지도", sources.map],
    ["시설 자료", sources.diagram || sources.facilities],
  ]) {
    if (!url) continue;
    const link = document.createElement("a");
    link.textContent = label + " ↗";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    help.append(link, " ");
  }
  const dock = $(".tool-dock");
  dock.querySelectorAll("[data-tool]").forEach((node) => node.remove());
  const fragment = document.createDocumentFragment();
  const list = $("#help-dialog ul");
  list.replaceChildren();
  for (const tool of tools) {
    const button = document.createElement("button");
    button.className = "tool" + (tool.id === "nuke" ? " nuclear" : "");
    button.dataset.tool = tool.id;
    button.setAttribute("aria-pressed", "false");
    const key = document.createElement("kbd");
    key.textContent = tool.key;
    const icon = document.createElement("span");
    icon.className = "tool-icon";
    icon.textContent = tool.icon;
    const label = document.createElement("span");
    label.textContent = tool.label;
    button.append(key, icon, label);
    fragment.append(button);
    const item = document.createElement("li"),
      name = document.createElement("b");
    name.textContent = tool.label;
    item.append(name, " — " + tool.help);
    list.append(item);
  }
  dock.prepend(fragment);
  $(".controls-help").textContent =
    "클릭 · 도구 사용 / 드래그 · 회전 / 휠 · 확대 / " +
    tools.map((t) => t.key).join("·") +
    " · 도구 선택";
}
