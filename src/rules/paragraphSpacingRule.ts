import type { TextRule } from '../types/TextRule';

export const paragraphSpacingRule: TextRule = {
  id: 'paragraph-spacing',
  name: '段落間の空行',
  description: '段落間の空行を削除します',
  pattern: /\n\s*\n/g,
  replace: '\n'
};
