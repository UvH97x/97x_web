export function texToAsciiMath(text: string) {
  return text.replace(/\\sqrt\{(.+?)\}/g, 'sqrt($1)')
  .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '($1)/($2)')
  .replace(/\^/g, '^')
  .replace(/_/g, '_')
  .replace(/\\cdot/g, '*')
  .replace(/\\times/g, 'times')
  .replace(/\\left\(/g, '(')
  .replace(/\\right\)/g, ')');
}