import sshs from "./sshs/index.js";
import gshs from "./gshs/index.js";
import ishs from "./ishs/index.js";
import ksa from "./ksa/index.js";
import gsa from "./gsa/index.js";
import dgshs from "./dgshs/index.js";
import djshs from "./djshs/index.js";
import hshs from "./hshs/index.js";
// Gifted science academies first; science high schools follow.
export const schools = [sshs, gshs, ksa, gsa, dgshs, djshs, ishs, hshs];
export function getSchool(id) {
  const school = schools.find((s) => s.id === id);
  if (!school) throw new Error("Unknown school: " + id);
  return school;
}
