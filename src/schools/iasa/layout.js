import {
  segment,
  building,
  bridge,
  point,
  finishLayout,
} from "../shared/layout.js";
import { addDetails } from "./details.js";

// Local +u follows the Songdo block southeast; +v faces Academy-ro southwest.
// Dimensions and the identification of wings are image-based approximations.
export const siteFrame = { x: -4, z: -5, angle: -0.7 };
export const sitePoint = (u, v) => point(siteFrame, u, v);
export const siteSegment = (u, v, w, d, extra = {}) => {
  const p = sitePoint(u, v);
  return segment(p.x, p.z, w, d, { angle: siteFrame.angle, ...extra });
};
const coordinates = (u, v) => {
  const p = sitePoint(u, v);
  return [p.x, p.z];
};

export function createLayout() {
  const s = siteSegment;
  const layout = {
    sources: {
      official: "https://iasa.icehs.kr/main.do",
      map: "https://map.naver.com/p/search/인천과학예술영재학교",
      aerial: "https://www.ajunews.com/view/20141224112602285",
      brochure:
        "https://iasa.icehs.kr/boardCnts/fileDown.do?fileSeq=27ae05b0b7c480e1bcaf012a491be920",
      checked: "2026-10-29",
    },
    buildings: [
      building("인문동 · 본관", 5, 1.5, "#dedacb", [
        s(-18, 10, 32, 7),
        s(-7, 19, 8, 11, { color: "#b59669" }),
        s(1.25, 10, 6.5, 4),
      ]),
      building("과학동 · 천문대", 5, 1.5, "#dbe0d9", [
        s(14, 16, 19, 10),
        s(14, 8, 19, 6, { observatory: true }),
      ]),
      building("융합동", 5, 1.5, "#ded8c7", [
        s(-17, -8, 26, 7),
        s(-17, -0.5, 7, 8),
      ]),
      // The broad low gym roof is separate from the five-floor classroom wing.
      // Three game levels approximate its hall height, not three full gym floors.
      building("체육관 · 대강당", 3, 1.5, "#c8ceca", [
        s(-20, -20, 28, 16, { roofColor: "#b7c4c4" }),
      ]),
      building("기숙사동", 6, 1.5, "#dcd8c9", [
        s(11, -16, 8, 19),
        s(20, -7, 10, 8),
      ]),
    ],
    links: [
      bridge(
        "융합동–인문동 갤러리",
        sitePoint(-17, 3.5),
        sitePoint(-17, 6.5),
        4.5,
        1,
        3.2,
      ),
      bridge("융합동–기숙사", sitePoint(-4, -8), sitePoint(7, -8), 4.5, 1, 3),
      bridge(
        "기숙사–인문과학동",
        sitePoint(7, -6.5),
        sitePoint(3, 8),
        4.5,
        1,
        3,
      ),
    ],
    observatory: {
      ...sitePoint(21, 18),
      y: 16.75,
      building: 1,
      radius: 1.6,
      color: "#dce3de",
    },
    field: {
      ...s(41, 5.5, 34, 23, { angle: siteFrame.angle + Math.PI / 2 }),
      height: 1.5,
      surface: "dirt",
      color: "#b6b19c",
    },
    tennis: {
      ...s(39, -23, 15, 9, { angle: siteFrame.angle + Math.PI / 2 }),
      height: 1.5,
    },
    courtKind: "basketball",
    gate: { ...sitePoint(-43, 5), angle: siteFrame.angle + Math.PI / 2 },
    parking: { ...sitePoint(-40, -13), angle: siteFrame.angle + Math.PI / 2 },
    benches: [
      coordinates(-24, 22),
      coordinates(-29, 20),
      coordinates(-4, 2),
      coordinates(-4, -1),
      coordinates(23, -22),
      coordinates(25, 25),
    ],
    trees: [
      ...Array.from({ length: 12 }, (_, i) => coordinates(-35 + i * 7.7, 29)),
      ...Array.from({ length: 10 }, (_, i) => coordinates(-36 + i * 7.7, -29)),
      ...Array.from({ length: 7 }, (_, i) => coordinates(-45, -25 + i * 8)),
      ...Array.from({ length: 6 }, (_, i) => coordinates(56, -10 + i * 6.2)),
      ...[
        [-33, 18],
        [-28, 18],
        [-24, 25],
        [-18, 24],
        [-15, 20],
        [0, 23],
        [3, 24],
        [27, -21],
        [28, -14],
        [22, -24],
        [-9, 1],
        [-9, 4],
      ].map(([u, v]) => coordinates(u, v)),
    ],
    maxTrees: 47,
    hills: [],
  };
  addDetails(layout);
  // Reclaimed Songdo ground is essentially level at the scale of this model.
  return finishLayout(layout, () => 1.5);
}
