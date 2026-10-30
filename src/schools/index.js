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
import ddshs from "./ddshs/index.js";
import bssh from "./bssh/index.js";
import cshs from "./cshs/index.js";
import hafs from "./hafs/index.js";
import sunduck from "./sunduck/index.js";
import jshs from "./jshs/index.js";
import gssh from "./gssh/index.js";
import gnsh from "./gnsh/index.js";
import dg1s from "./dg1s/index.js";
import unjeong from "./unjeong/index.js";
import kmla from "./kmla/index.js";
import hwasung from "./hwasung/index.js";
import ijshs from "./ijshs/index.js";
// Category metadata determines the lobby sections and selector optgroups.
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
  ddshs,
  bssh,
  cshs,
  jshs,
  gssh,
  gnsh,
  dg1s,
  ijshs,
  hafs,
  sunduck,
  kmla,
  unjeong,
  hwasung,
];
export function getSchool(id) {
  const school = schools.find((s) => s.id === id);
  if (!school) throw new Error("Unknown school: " + id);
  return school;
}
