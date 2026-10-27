/** Preserve legacy storage keys while keeping every campus independent. */
export function createScoreStore(schoolId, storage) {
  const key = schoolId + "-playground-best";
  return {
    read() {
      try {
        return (
          Number((storage ?? globalThis.localStorage).getItem(key) || 0) || 0
        );
      } catch {
        return 0;
      }
    },
    write(value) {
      try {
        (storage ?? globalThis.localStorage).setItem(key, String(value));
      } catch {}
    },
  };
}
