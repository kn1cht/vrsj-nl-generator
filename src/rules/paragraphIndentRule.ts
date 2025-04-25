import type { TextRule } from '../types/TextRule';

export const paragraphIndentRule: TextRule = {
  id: 'paragraph-indent',
  name: '段落頭字下げ',
  description: '句点を含む段落の先頭に全角スペースを挿入します',
  pattern: /(^|\n)[ \t]*([^\u3000\s])(.*?[。．.！!？?]+.*?)(?=\n|$)/g,
  replace: (_match: string, p1: string, p2: string, p3: string) => {
    return `${p1}\u3000${p2}${p3}`;
  }
};
