import type { TextRule } from '../types/TextRule';

export const parenthesesPairRule: TextRule = {
  id: 'parentheses-pair',
  name: '括弧ペア修正',
  description: '全角・半角がマッチしていない括弧のペアを全角括弧に修正します',
  pattern: /(?:\([^)）]*）|\（[^)）]*\))/g,
  replace: (match: string) => {
    // 括弧内の内容を取得
    const content = match.slice(1, -1);
    // 全角括弧で統一
    return `（${content}）`;
  }
};
