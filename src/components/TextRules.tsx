import { useEffect, useState } from 'react';

type TextRule = {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  replace?: ((match: string) => string | null) | string | ((match: string, ...args: string[]) => string | null);
  detectIssues?: (matches: RegExpMatchArray | null) => number;
};

const TEXT_RULES: TextRule[] = [
  {
    id: 'full-width-alphanumeric',
    name: '全角英数字',
    description: '全角英数字を半角英数字に変換します',
    pattern: /[Ａ-Ｚａ-ｚ０-９]/g,
    replace: (match: string) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)
  },
  {
    id: 'paragraph-spacing',
    name: '段落間の空行',
    description: '段落間の空行を削除します',
    pattern: /\n\s*\n/g,
    replace: '\n'
  },
  {
    id: 'paragraph-indent',
    name: '段落頭字下げ',
    description: '句点を含む段落の先頭に全角スペースを挿入します',
    pattern: /(^|\n)([^\u3000\s])(.*?[。．.！!？?]+.*?)(?=\n|$)/g,
    replace: (_match: string, p1: string, p2: string, p3: string) => {
      return `${p1}\u3000${p2}${p3}`;
    }
  },
  {
    id: 'punctuation',
    name: '句読点',
    description: '句読点を，．に統一します',
    pattern: /([、。])/g,
    replace: (match: string) => {
      if (match === '、') return '，';
      if (match === '。') return '．';
      return match;
    }
  },
  {
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
  }
];

type TextRulesProps = {
  text: string;
  index: number;
  onApplyFix: (fixedText: string, index: number) => void;
};

const TextRules = ({ text, index, onApplyFix }: TextRulesProps) => {
  const [issues, setIssues] = useState<{ rule: TextRule; count: number }[]>([]);

  useEffect(() => {
    const foundIssues = TEXT_RULES.map(rule => {
      const matches = text.match(rule.pattern);
      const count = rule.detectIssues ? rule.detectIssues(matches) : (matches ? matches.length : 0);
      return { rule, count };
    }).filter(issue => issue.count > 0);

    setIssues(foundIssues);
  }, [text]);

  const handleApplyFix = (rule: TextRule, index: number) => {
    if (rule.replace) {
      let fixedText: string;
      if (typeof rule.replace === 'string') {
        fixedText = text.replace(rule.pattern, rule.replace);
      } else {
        fixedText = text.replace(rule.pattern, (...args) => {
          const result = rule.replace && typeof rule.replace === 'function' ? rule.replace(...args) : args[0];
          // nullが返された場合は元のテキストを使用
          return result === null ? args[0] : result;
        });
      }
      onApplyFix(fixedText, index);
    }
  };

  if (issues.length === 0) {
    return <div className="text-rules">テキストの問題は検出されませんでした。</div>;
  }

  return (
    <div className="text-rules">
      <ul className="rules-list">
        {issues.map(({ rule, count }) => (
          <li key={rule.id} className="rule-item">
            <div className="rule-info">
              <span className="rule-name">{rule.name}</span>
              <span className="rule-count">{count}件</span>
              <p className="rule-description">{rule.description}</p>
            </div>
            {rule.replace && (
              <button className="fix-button" onClick={() => handleApplyFix(rule, index)}>
                適用
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TextRules;
