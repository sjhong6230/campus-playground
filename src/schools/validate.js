/** Fail during build instead of shipping an unselectable or broken campus. */
export function validateSchools(schools) {
  if (!schools.length) throw new Error("Register at least one school");
  const ids = new Set();
  for (const school of schools) {
    if (!/^[a-z][a-z0-9-]*$/.test(school.id) || ids.has(school.id))
      throw new Error("Invalid/duplicate school id: " + school.id);
    ids.add(school.id);
    for (const key of [
      "name",
      "shortName",
      "nickname",
      "abbr",
      "location",
      "eyebrow",
      "accent",
    ])
      if (typeof school[key] !== "string" || !school[key])
        throw new Error(`${school.id}: missing ${key}`);
    if (
      typeof school.createLayout !== "function" ||
      typeof school.paintGround !== "function"
    )
      throw new Error(school.id + ": missing layout/ground factory");
    const l = school.createLayout();
    if (
      !l.buildings?.length ||
      typeof l.elevationAt !== "function" ||
      typeof l.point !== "function"
    )
      throw new Error(school.id + ": invalid layout");
    for (const key of ["field", "gate", "sources"])
      if (!l[key]) throw new Error(school.id + ": missing " + key);
    for (const b of l.buildings) {
      if (
        !Number.isInteger(b.floors) ||
        b.floors < 1 ||
        !Number.isFinite(b.baseY) ||
        !b.segments?.length
      )
        throw new Error(school.id + ": invalid building " + b.name);
      for (const s of b.segments) {
        if (
          ![s.x, s.z, s.w, s.d, s.angle ?? 0].every(Number.isFinite) ||
          s.w <= 0 ||
          s.d <= 0
        )
          throw new Error(school.id + ": invalid segment " + b.name);
        for (const u of [-s.w / 2, s.w / 2])
          for (const v of [-s.d / 2, s.d / 2]) {
            const p = l.point(s, u, v);
            if (Math.abs(p.x) > 75.5 || Math.abs(p.z) > 59)
              throw new Error(
                school.id + ": building outside terrain " + b.name,
              );
          }
      }
    }
  }
}
