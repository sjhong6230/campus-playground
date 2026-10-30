import { segment as s, building as b, finishLayout } from "../shared/layout.js";
import { addDetails } from "./details.js";

// Official 2025 video opening and homepage photo; dimensions are estimates.
export function createLayout() {
  const layout = {
    sources: {
      official: "https://school.jje.go.kr/jeju-s/main.do",
      facilities:
        "https://school.jje.go.kr/jeju-s/cm/cntnts/cntntsView.do?cntntsId=108047&mi=108047",
      photos:
        "https://school.jje.go.kr/upload/jeju-s/widg/img_aaffv9803=56v67=4ev80=b9va3=50e5vc595v2023_v8073.png",
      video:
        "https://school.jje.go.kr/common/na/ntt/vodPlay.do?mi=108048&nttSn=40561486",
      map: "https://map.naver.com/p/search/제주과학고등학교",
      checked: "2026-10-30",
    },
    buildings: [
      b("본관 · 중앙현관", 3, 2.5, "#e1d8c6", [
        s(0, -26, 16, 15, { roof: "gable", roofColor: "#666a6c" }),
        s(-23, -23, 30, 11, {
          angle: 0.12,
          roof: "gable",
          roofColor: "#656a68",
          color: "#c8a693",
        }),
        s(24, -19, 31, 11, {
          angle: -0.27,
          roof: "gable",
          roofColor: "#656a68",
          color: "#d4b39b",
        }),
      ]),
      b("동측 연구동", 3, 2.5, "#c4b5aa", [
        s(48, -5, 17, 36, { roof: "gable", roofColor: "#b6c4cc" }),
      ]),
      b("서측 생활관 · 근사", 3, 2.5, "#989a96", [s(-53, -26, 22, 28)]),
      b("서측 별관", 2, 2.5, "#858d8b", [
        s(-51, 0, 24, 15, { roof: "gable", roofColor: "#666f6e" }),
      ]),
    ],
    links: [],
    field: {
      ...s(1, 33, 70, 23),
      height: 1.5,
      surface: "grass",
      color: "#8d9c70",
    },
    tennis: { ...s(0, 1, 23, 15), height: 2.5 },
    courtKind: "basketball",
    gate: { x: 53, z: 47, angle: 0 },
    parking: { x: 28, z: 6, angle: Math.PI / 2 },
    benches: [
      [-19, 12],
      [-10, 14],
      [0, 14],
    ],
    trees: [
      ...Array.from({ length: 17 }, (_, i) => [-70, -51 + i * 6.4]),
      ...Array.from({ length: 18 }, (_, i) => [-65 + i * 7.4, -54]),
      ...Array.from({ length: 17 }, (_, i) => [-64 + i * 8, 54]),
      [-28, 6],
      [-26, 13],
      [-39, 14],
      [18, 14],
    ],
    maxTrees: 56,
    hills: [],
  };
  addDetails(layout);
  return finishLayout(layout, (x, z) => 1.5 + Math.max(0, -z - 35) * 0.15);
}
