/**
 * Prints the current skill library as Markdown, for pasting into SWIMMING_SKILLS_REVIEW.md
 * after the criteria change.   node scripts/skills-review.mjs
 */
const { SKILLS, CATEGORIES } = await import('../src/data/skills.ts');
let n = 0;
for (const category of CATEGORIES) {
  console.log(`\n### ${category.name}\n`);
  for (const skill of SKILLS.filter((s) => s.categoryId === category.id)) {
    n += 1;
    console.log(`#### ${n}. ${skill.name}\n`);
    console.log(`*Parent-facing summary:* ${skill.summary}\n`);
    console.log(`*Objective:* ${skill.objective}\n`);
    console.log('*Success criteria:*\n');
    skill.successCriteria.forEach((c, i) => console.log(`${i + 1}. ${c}`));
    console.log(`\n<!-- flags:${skill.id} -->\n`);
  }
}
