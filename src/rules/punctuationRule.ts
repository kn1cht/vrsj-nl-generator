import type { TextRule } from '../types/TextRule';

export const punctuationRule: TextRule = {
  id: 'punctuation',
  name: '句読点',
  description: '句読点を，．に統一します',
  pattern: /([、。])/g,
  replace: (match: string) => {
    if (match === '、') return '，';
    if (match === '。') return '．';
    return match;
  }
};
