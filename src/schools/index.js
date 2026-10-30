import sshs from "./sshs/index.js";
import gshs from "./gshs/index.js";
import ishs from "./ishs/index.js";
import ksa from "./ksa/index.js";
import gsa from "./gsa/index.js";
import dgshs from "./dgshs/index.js";
import djshs from "./djshs/index.js";
import hssh from "./hssh/index.js";
import sjshs from "./sjshs/index.js";
import bsis from "./bsis/index.js";
import gbs from "./gbs/index.js";
import iasa from "./iasa/index.js";
import sasa from "./sasa/index.js";
import kbsh from "./kbsh/index.js";
// Gifted science academies first; science high schools follow.
export const schools = [
  sshs,
  gshs,
  ksa,
  gsa,
  dgshs,
  djshs,
  iasa,
  sasa,
  ishs,
  hssh,
  sjshs,
  bsis,
  gbs,
  kbsh,
];
export function getSchool(id) {
  const school = schools.find((s) => s.id === id);
  if (!school) throw new Error("Unknown school: " + id);
  return school;
}
