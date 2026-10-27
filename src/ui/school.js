import { tools } from "../tools/catalog.js";

export function bindSchoolUI(school) {
  const $ = (selector) => document.querySelector(selector);
  document.title =
    school.shortName + " 부수기 · " + school.abbr + " PLAYGROUND";
  $('meta[name="description"]').content = school.name + " 모형 캠퍼스 샌드박스";
  $("#scene").setAttribute(
    "aria-label",
    school.name +
      " 모형. 건물, 나무, 운동장, 시설물을 누르면 선택한 도구가 작동합니다.",
  );
  $(".brand").setAttribute("aria-label", school.shortName + " 부수기");
  $(".brand-icon").firstChild.textContent = school.abbr[0];
  $(".brand > span:last-child").firstChild.textContent = school.abbr;
  $(".campus-tag").replaceChildren();
  const dot = document.createElement("span");
  dot.className = "live-dot";
  $(".campus-tag").append(dot, school.name + " / " + school.location);
  $(".intro .eyebrow").textContent = school.eyebrow;
  const title = $(".intro h1");
  title.replaceChildren(
    "오늘은,",
    document.createElement("br"),
    school.nickname +
      ((school.nickname.charCodeAt(school.nickname.length - 1) - 0xac00) % 28
        ? "을 "
        : "를 "),
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
    link.rel = "noopener";
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
