const countExportedFunctions = (content) => {
  const regex = /export\s+(?:(?:async\s+)?function\b|(?:const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|default\s+(?:(?:async\s+)?function|(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>))/g;
  let count = 0;
  while (regex.exec(content)) count++;
  if (content.includes('module.exports')) count++;
  return count;
};

const countFunctionLevelDocs = (content) => {
  const regex = /\/\*\*[\s\S]*?\*\/\s*export\s+(?:(?:async\s+)?function\b|(?:const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|default\s+(?:(?:async\s+)?function|(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>))/g;
  let count = 0;
  while (regex.exec(content)) count++;
  return count;
};

const testCode = `
  export const shouldNotCount = 5;
  export async function shouldCount1() {}
  export const shouldCount2 = async () => {}
  export const shouldCount3 = (x) => {}
  export default function shouldCount4() {}
  module.exports = {};
  
  export const multilineCount = (
    req,
    res
  ) => {}

  /** doc */
  export async function docCount1() {}
  
  /** doc */
  export const docCount2 = async () => {}
  
  /** doc */
  export const docCount3 = (req, res, next) => {}
`;
console.log("Exports:", countExportedFunctions(testCode)); // Expected: 9
console.log("Docs:", countFunctionLevelDocs(testCode)); // Expected: 3
