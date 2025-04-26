import { useState } from 'react';

// デフォルトの禁則文字設定
export const DEFAULT_FORMAT_SETTINGS = {
  maxCharsPerLine: 75, // 半角文字数
  dropChars: ';・.､｡、。，．｣」』）〕］｝〉】', // ぶら下げ文字
  lineStartForbidChars: ']}):;?!ﾞﾟ”･~：；？！゛゜‐\'"）〕］｝〉」』】', // 行頭禁則文字
  lineEndForbidChars: '[{(\'"“（〔［｛〈「『【「' // 行末禁則文字
};

export type FormatSettings = typeof DEFAULT_FORMAT_SETTINGS;

export const formatTextForMail = (text: string, settings: FormatSettings = DEFAULT_FORMAT_SETTINGS): string => {
  const lines: string[] = [];
  const { maxCharsPerLine, dropChars, lineStartForbidChars, lineEndForbidChars } = settings;

  // 実際の最大文字数を計算
  const effectiveMaxChars = maxCharsPerLine;

  // テキストを行に分割して処理
  const inputLines = text.split('\n');

  // 文字列から英数字の単語を取得するヘルパー関数
  const getMatchedWord = (text: string): { word: string, length: number } | null => {
    const wordRegex = /^[a-zA-Z0-9\-'.]+/;
    const match = text.match(wordRegex);
    if (match && match[0]) {
      return { word: match[0], length: match[0].length };
    }
    return null;
  };

  inputLines.forEach(line => {
    // 空行の場合はそのまま追加
    if (line.trim() === '') {
      lines.push('');
      return;
    }

    let currentLine = '';
    let currentWidth = 0;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = i + 1 < line.length ? line[i + 1] : '';
      const remainingText = line.slice(i);

      // 文字の幅を計算（全角か半角か）
      const charWidth = isFullWidth(char) ? 2 : 1;

      // 英単語または数値の連続があるか確認
      const wordMatch = getMatchedWord(remainingText);

      if (wordMatch) {
        const word = wordMatch.word;
        // 単語の幅を計算
        let wordWidth = 0;
        for (let j = 0; j < word.length; j++) {
          wordWidth += isFullWidth(word[j]) ? 2 : 1;
        }

        // 単語または数値が行をはみ出す場合で、かつ現在の行が空でない場合
        if (currentWidth + wordWidth > effectiveMaxChars && currentWidth > 0) {
          // 直前の行の最後の文字を取得
          const lastCharOfCurrentLine = currentLine.slice(-1);
          // 行末禁則文字かどうかをチェック
          if (lineEndForbidChars.includes(lastCharOfCurrentLine)) {
            // 禁則文字を行頭に送る
            const lineWithoutLastChar = currentLine.slice(0, -1);
            lines.push(lineWithoutLastChar);
            currentLine = lastCharOfCurrentLine;
            currentWidth = isFullWidth(lastCharOfCurrentLine) ? 2 : 1;
          } else {
            lines.push(currentLine);
            currentLine = '';
            currentWidth = 0;
          }
        }

        // 単語を追加
        currentLine += word;
        currentWidth += wordWidth;
        i += wordMatch.length;
      } else {
        // 禁則処理
        // ぶら下げ文字の処理
        if (dropChars.includes(char) && currentWidth + charWidth > effectiveMaxChars) {
          currentLine += char;
          lines.push(currentLine);
          currentLine = '';
          currentWidth = 0;
          i++;
          continue;
        }

        // 行頭禁則文字の処理
        if (nextChar && lineStartForbidChars.includes(nextChar) && currentWidth + charWidth + (isFullWidth(nextChar) ? 2 : 1) > effectiveMaxChars) {
          lines.push(currentLine);
          currentLine = char + nextChar;
          currentWidth = charWidth + (isFullWidth(nextChar) ? 2 : 1);
          i += 2;
          continue;
        }

        // 行末禁則文字の処理
        if (lineEndForbidChars.includes(char) && currentWidth + charWidth >= effectiveMaxChars) {
          lines.push(currentLine);
          currentLine = char;
          currentWidth = charWidth;
          i++;
          continue;
        }

        // 通常の文字処理
        if (currentWidth + charWidth > effectiveMaxChars) {
          lines.push(currentLine);
          currentLine = char;
          currentWidth = charWidth;
        } else {
          currentLine += char;
          currentWidth += charWidth;
        }
        i++;
      }
    }

    // 最後の行があれば追加
    if (currentLine) {
      lines.push(currentLine);
    }
  });

  return lines.join('\n');
};

// 全角文字かどうかを判定
const isFullWidth = (char: string): boolean => {
  // Unicodeのコードポイントを取得
  const code = char.charCodeAt(0);

  // 一般的な全角文字の範囲
  return (
    (code >= 0x3000 && code <= 0x9FFF) ||  // CJK統合漢字、ひらがな、カタカナなど
    (code >= 0xFF00 && code <= 0xFFEF) ||  // 全角英数字、記号
    (code >= 0x20000 && code <= 0x2A6DF) || // CJK統合漢字拡張B
    (code >= 0x2A700 && code <= 0x2B73F) || // CJK統合漢字拡張C
    (code >= 0x2B740 && code <= 0x2B81F) || // CJK統合漢字拡張D
    (code >= 0x2B820 && code <= 0x2CEAF) || // CJK統合漢字拡張E
    (code >= 0x2CEB0 && code <= 0x2EBEF) || // CJK統合漢字拡張F
    (code >= 0xF900 && code <= 0xFAFF) ||   // CJK互換漢字
    (code === 0x00A1) || // ¡
    (code === 0x00A4) || // ¤
    (code === 0x00A7) || // §
    (code === 0x00A8) || // ¨
    (code === 0x00AA) || // ª
    (code === 0x00AD) || // ­
    (code === 0x00AE) || // ®
    (code === 0x00B0) || // °
    (code === 0x00B1) || // ±
    (code === 0x00B4) || // ´
    (code === 0x00B6) || // ¶
    (code === 0x00B7) || // ·
    (code === 0x00B8) || // ¸
    (code === 0x00BA) || // º
    (code === 0x00BC) || // ¼
    (code === 0x00BD) || // ½
    (code === 0x00BE) || // ¾
    (code === 0x00BF) || // ¿
    (code === 0x00C6) || // Æ
    (code === 0x00D0) || // Ð
    (code === 0x00D7) || // ×
    (code === 0x00D8) || // Ø
    (code === 0x00DE) || // Þ
    (code === 0x00DF) || // ß
    (code === 0x00E6) || // æ
    (code === 0x00E7) || // ç
    (code === 0x00F0) || // ð
    (code === 0x00F7) || // ÷
    (code === 0x00F8) || // ø
    (code === 0x00FE) || // þ
    (code === 0x0153) || // œ
    (code === 0x0132) || // Ĳ
    (code >= 0x2500 && code <= 0x257F) // Box Drawing
  );
};

type TextFormatterProps = {
  settings: FormatSettings;
  onSettingsChange: (settings: FormatSettings) => void;
};

const TextFormatter: React.FC<TextFormatterProps> = ({ settings, onSettingsChange }) => {
  const [maxChars, setMaxChars] = useState(settings.maxCharsPerLine);
  const [dropChars, setDropChars] = useState(settings.dropChars);
  const [lineStartForbidChars, setLineStartForbidChars] = useState(settings.lineStartForbidChars);
  const [lineEndForbidChars, setLineEndForbidChars] = useState(settings.lineEndForbidChars);

  const handleApplySettings = () => {
    onSettingsChange({
      maxCharsPerLine: maxChars,
      dropChars,
      lineStartForbidChars,
      lineEndForbidChars
    });
  };

  return (
    <div className="settings-panel">
      <h3>テキスト整形設定</h3>
      <div className="formatter-settings">
        <div className="form-group">
          <label htmlFor="maxChars">1行あたりの最大文字数（半角）</label>
          <input
            type="number"
            id="maxChars"
            value={maxChars}
            onChange={(e) => setMaxChars(Number(e.target.value))}
            min="20"
            max="200"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dropChars">ぶら下げ文字</label>
          <input
            type="text"
            id="dropChars"
            value={dropChars}
            onChange={(e) => setDropChars(e.target.value)}
          />
          <small className="form-help">行末にある場合にはみ出しを許容する文字</small>
        </div>

        <div className="form-group">
          <label htmlFor="lineStartForbidChars">行頭禁則文字</label>
          <input
            type="text"
            id="lineStartForbidChars"
            value={lineStartForbidChars}
            onChange={(e) => setLineStartForbidChars(e.target.value)}
          />
          <small className="form-help">行頭に来てはいけない文字</small>
        </div>

        <div className="form-group">
          <label htmlFor="lineEndForbidChars">行末禁則文字</label>
          <input
            type="text"
            id="lineEndForbidChars"
            value={lineEndForbidChars}
            onChange={(e) => setLineEndForbidChars(e.target.value)}
          />
          <small className="form-help">行末に来てはいけない文字</small>
        </div>

        <button
          onClick={handleApplySettings}
          className="settings-apply-btn"
        >
          設定を適用
        </button>
      </div>
    </div>
  );
};

export default TextFormatter;
