const { diffWords } = require("diff");

const hasChanged = (
  previousContent,
  currentContent
) => {
  return (
    previousContent.trim() !==
    currentContent.trim()
  );
};

const generateDiff = (
  previousContent,
  currentContent
) => {
  const differences = diffWords(
    previousContent,
    currentContent
  );

  return differences
    .map((part) => {
      if (part.added) {
        return `[ADDED] ${part.value}`;
      }

      if (part.removed) {
        return `[REMOVED] ${part.value}`;
      }

      return part.value;
    })
    .join("");
};

module.exports = {
  hasChanged,
  generateDiff,
};