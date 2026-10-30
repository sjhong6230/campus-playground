export const schoolCategories = [
  { id: "gifted", label: "영재학교" },
  { id: "science", label: "과학고등학교" },
  { id: "autonomous", label: "자율형 사립고등학교" },
  { id: "autonomous-public", label: "자율형 공립고등학교" },
  { id: "general", label: "일반고등학교" },
];

export function groupSchools(schools) {
  return schoolCategories
    .map((category) => ({
      ...category,
      schools: schools.filter((school) => school.category === category.id),
    }))
    .filter((category) => category.schools.length);
}
