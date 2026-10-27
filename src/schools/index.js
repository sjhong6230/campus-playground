import sshs from "./sshs/index.js";
import gshs from "./gshs/index.js";
import ishs from "./ishs/index.js";
import ksa from "./ksa/index.js";
import gsa from "./gsa/index.js";
export const schools = [sshs, gshs, ishs, ksa, gsa];
export function getSchool(id) {
  const school = schools.find((s) => s.id === id);
  if (!school) throw new Error("Unknown school: " + id);
  return school;
}
