export type TextRule = {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  replace?: ((match: string) => string | null) | string | ((match: string, ...args: string[]) => string | null);
  detectIssues?: (matches: RegExpMatchArray | null) => number;
};
