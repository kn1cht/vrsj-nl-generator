import type { TextRule } from '../types/TextRule';

export const urlFormatRule: TextRule = {
  id: 'url-format',
  name: 'URL形式',
  description: 'URLの末尾を適切な形式に修正します',
  pattern: /(https?:\/\/[^\s"'<>()[\]{}]+)(?=[\s,.!?;"'<>()[\]{}]|$)/g,
  replace: (match: string) => {
    // 既に形式が正しい場合は元のURLを返す
    const originalMatch = match;
    // index.htmlで終わるURLから末尾を削除
    if (match.endsWith('/index.html')) {
      match = match.slice(0, -11); // '/index.html'の11文字を削除
    }
    // ドメイン名だけで終わる場合や、ファイル名・クエリパラメータがない場合はスラッシュを追加
    if (!match.endsWith('/') && !match.includes('?') && !/\/[^/]+\.[^/]+$/.test(match)) {
      match = match + '/';
    }
    // 変更がない場合は null を返して置換しないようにする
    return match === originalMatch ? null : match;
  },
  detectIssues: (matches: RegExpMatchArray | null) => {
    if (!matches) return 0;
    return matches.filter(match => {
      // index.htmlで終わるURL
      if (match.endsWith('/index.html')) return true;
      // ドメイン名だけで終わる場合や、ファイル名・クエリパラメータがない場合
      if (!match.endsWith('/') && !match.includes('?') && !/\/[^/]+\.[^/]+$/.test(match)) return true;
      return false;
    }).length;
  }
};
