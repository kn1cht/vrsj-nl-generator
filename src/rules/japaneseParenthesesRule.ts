import type { TextRule } from '../types/TextRule';

export const japaneseParenthesesRule: TextRule = {
  id: 'japanese-parentheses',
  name: '日本語括弧修正',
  description: '括弧内に日本語が含まれている場合、半角括弧を全角括弧に修正します',
  pattern: /\([^)]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][^)]*\)/g,
  replace: (match: string) => {
    // 括弧内の内容を取得
    const content = match.slice(1, -1);
    // 全角括弧に変換
    return `（${content}）`;
  }
};
