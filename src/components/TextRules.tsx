import { useEffect, useState } from 'react';
import type { TextRule } from '../types/TextRule';

type TextRulesProps = {
  text: string;
  index: number;
  rules: TextRule[];
  onApplyFix: (fixedText: string, index: number) => void;
};

const TextRules = ({ text, index, rules, onApplyFix }: TextRulesProps) => {
  const [issues, setIssues] = useState<{ rule: TextRule; count: number }[]>([]);

  useEffect(() => {
    const foundIssues = rules.map(rule => {
      const matches = text.match(rule.pattern);
      const count = rule.detectIssues ? rule.detectIssues(matches) : (matches ? matches.length : 0);
      return { rule, count };
    }).filter(issue => issue.count > 0);

    setIssues(foundIssues);
  }, [text, rules]);

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
