const fs = require("fs");
const path = require("path");
const file = process.env.CAPVEST_INDEX_OUT || path.join(__dirname, "../data/questions-index.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const pattern = /(?:^|\n)\s*\(?([A-E])\)?\s*[).:\-]\s*([\s\S]*?)(?=(?:\n\s*\(?[A-E]\)?\s*[).:\-]\s*)|$)/gm;
function isMultipleChoice(text) {
  const found = new Set([...String(text || "").matchAll(pattern)].map((match) => match[1].toUpperCase()));
  return found.size >= 4 && ["A", "B", "C", "D"].every((letter) => found.has(letter));
}
const numbered = (data.questions || []).filter((question) => question.number !== null && question.number !== undefined);
const objective = numbered.filter((question) => isMultipleChoice(question.text));
const open = numbered.filter((question) => !isMultipleChoice(question.text));
const withKey = objective.filter((question) => question.answer?.length || question.annulled);
const withoutKey = objective.length - withKey.length;
const byVestibular = {};
for (const question of numbered) byVestibular[question.vestibularId] = (byVestibular[question.vestibularId] || 0) + 1;
console.log(JSON.stringify({
  indexFile: file,
  generatedAt: data.generatedAt || null,
  documents: data.documents?.length || 0,
  indexedQuestions: data.questions?.length || 0,
  numberedQuestions: numbered.length,
  objectiveQuestions: objective.length,
  objectiveWithAnswerKey: withKey.length,
  objectiveWithoutAnswerKey: withoutKey,
  openQuestions: open.length,
  questionsByVestibular: byVestibular
}, null, 2));
