// The engine is embedded once. Replacing the iframe releases the previous world,
// WebGL context and animation loop without retaining another campus instance.
const { schools, template } = JSON.parse(
  document.getElementById("campus-data").textContent,
);
const $ = (id) => document.getElementById(id),
  selector = $("school"),
  cards = document.querySelector(".cards");
let current = null;
for (const school of schools) {
  const option = document.createElement("option");
  option.value = school.id;
  option.textContent = school.name;
  selector.append(option);
  const button = document.createElement("button");
  button.className = "card";
  button.dataset.school = school.id;
  button.setAttribute("aria-label", school.name + " 시작");
  for (const [tag, cls, text] of [
    ["span", "initials", school.abbr],
    ["strong", "", school.name],
    ["span", "location", school.location],
    ["span", "start", "캠퍼스 들어가기 ↗"],
  ]) {
    const node = document.createElement(tag);
    node.className = cls;
    node.textContent = text;
    if (cls === "initials") node.style.color = school.accent;
    button.append(node);
  }
  button.addEventListener("click", () => start(school.id));
  cards.append(button);
}
function start(id) {
  const school = schools.find((s) => s.id === id);
  if (!school) return;
  current = id;
  selector.value = id;
  const frame = document.createElement("iframe");
  frame.title = school.name + " 부수기";
  // IDs are validated at build time and contain only ASCII letters, digits and '-'.
  frame.srcdoc = template.replaceAll("{{schoolId}}", id);
  $("stage").replaceChildren(frame);
  $("lobby").hidden = true;
  $("game").hidden = false;
  document.title = frame.title + " · CAMPUS PLAYGROUND";
  frame.addEventListener("load", () => frame.contentWindow.focus(), {
    once: true,
  });
}
selector.addEventListener("change", () => {
  if (selector.value !== current) start(selector.value);
});
$("back").addEventListener("click", () => {
  $("stage").replaceChildren();
  $("game").hidden = true;
  $("lobby").hidden = false;
  document.title = "과학고 부수기 · CAMPUS PLAYGROUND";
  document.querySelector(`[data-school="${current}"]`).focus();
  current = null;
});
