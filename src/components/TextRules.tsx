import { useEffect, useState } from 'react';

type TextRule = {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  replace?: ((match: string) => string) | string;
};

const TEXT_RULES: TextRule[] = [
  {
    id: 'double-space',
    name: '二重スペース',
    description: '二重スペースを検出します',
    pattern: /\s{2,}/g,
    replace: ' '
  },
  {
    id: 'ending-punctuation',
    name: '文末の句読点',
    description: '文末の句読点が抜けている可能性があります',
    pattern: /([^。！？.!?])\n/g,
    replace: '$1。\n'
  },
  {
    id: 'full-width-numbers',
    name: '全角数字',
    description: '全角数字を半角数字に変換します',
    pattern: /[０-９]/g,
    replace: (match: string) => String.fromCharCode(match.charCodeAt(0) - 0xFEE0)
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
