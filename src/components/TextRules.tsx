import { useEffect, useState } from 'react';

type TextRule = {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  replace?: ((match: string) => string) | string | ((match: string, ...args: string[]) => string);
};

const TEXT_RULES: TextRule[] = [
  {
    id: 'full-width-numbers',
    name: '全角数字',
    description: '全角数字を半角数字に変換します',
    pattern: /[０-９]/g,
    replace: (match: string) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)
  },
  {
    id: 'paragraph-indent',
    name: '段落頭字下げ',
    description: '句点を含む段落の先頭に全角スペースを挿入します',
    pattern: /(^|\n)([^\u3000\s])(.*?[。．.！!？?]+.*?)(?=\n|$)/g,
    replace: (match: string, p1: string, p2: string, p3: string) => {
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
  }
];

type TextRulesProps = {
  text: string;
  onApplyFix: (fixedText: string) => void;
};

const TextRules = ({ text, onApplyFix }: TextRulesProps) => {
  const [issues, setIssues] = useState<{ rule: TextRule; count: number }[]>([]);

  useEffect(() => {
    const foundIssues = TEXT_RULES.map(rule => {
      const matches = text.match(rule.pattern);
      return {
        rule,
        count: matches ? matches.length : 0
      };
    }).filter(issue => issue.count > 0);

    setIssues(foundIssues);
  }, [text]);

  const handleApplyFix = (rule: TextRule) => {
    if (rule.replace) {
      let fixedText: string;
      if (typeof rule.replace === 'string') {
        fixedText = text.replace(rule.pattern, rule.replace);
      } else {
        fixedText = text.replace(rule.pattern, rule.replace);
      }
      onApplyFix(fixedText);
    }
  };

  if (issues.length === 0) {
    return <div className="text-rules">テキストの問題は検出されませんでした。</div>;
  }

  return (
    <div className="text-rules">
      <h3>テキストの問題</h3>
      <ul className="rules-list">
        {issues.map(({ rule, count }) => (
          <li key={rule.id} className="rule-item">
            <div className="rule-info">
              <span className="rule-name">{rule.name}</span>
              <span className="rule-count">{count}件</span>
              <p className="rule-description">{rule.description}</p>
            </div>
            {rule.replace && (
              <button className="fix-button" onClick={() => handleApplyFix(rule)}>
                修正を適用
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TextRules; 
