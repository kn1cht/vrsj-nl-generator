import type { TextRule } from '../types/TextRule';

export const fullWidthAlphanumericRule: TextRule = {
  id: 'full-width-alphanumeric',
  name: '全角英数字',
  description: '全角英数字を半角英数字に変換します',
  pattern: /[Ａ-Ｚａ-ｚ０-９]/g,
  replace: (match: string) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)
};
