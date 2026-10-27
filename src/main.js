import { getSchool } from "./schools/index.js";
import { createGame } from "./core/game.js";
import { bindSchoolUI } from "./ui/school.js";
const school = getSchool(document.documentElement.dataset.school);
bindSchoolUI(school);
createGame(school);
