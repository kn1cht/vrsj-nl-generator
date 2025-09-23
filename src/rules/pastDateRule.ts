import type { TextRule } from '../types/TextRule';

/**
 * 過去日付ルールのファクトリ関数
 * 各インスタンスが独立した状態を持つようにする
 */
export function createPastDateRule(publicationYear?: string, publicationMonth?: string, publicationDate?: string): TextRule {
  let pastDatesInfo: string[] = [];

  return {
    id: 'past-date',
    name: '過去日付チェック',
    get description() {
      if (pastDatesInfo.length > 0) {
        const datesList = pastDatesInfo.join('、');
        return `${datesList}は過去の日付です。古い情報の可能性があります。`;
      }
      return '発行日よりも前の日付を検出します';
    },
    pattern: /[:：]\s*(.+?)(?=\n|$)/g,
    replace: undefined, // 置換は行わず、警告のみ
    detectIssues: (matches: RegExpMatchArray | null) => {
      // 過去の日付情報をリセット
      pastDatesInfo = [];
      
      if (!matches) return 0;

      // 発行日を設定（指定されていない場合は今日の日付を使用）
      let referenceDate: Date;
      if (publicationYear && publicationMonth && publicationDate) {
        const year = parseInt(publicationYear, 10);
        const month = parseInt(publicationMonth, 10);
        const day = parseInt(publicationDate, 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          referenceDate = new Date(year, month - 1, day);
        } else {
          referenceDate = new Date();
        }
      } else {
        referenceDate = new Date();
      }

      let issueCount = 0;

      for (const match of matches) {
        const dateText = match?.trim();
        if (!dateText) continue;

        const dates = extractDatesFromText(dateText);
        
        // 発行日より前の日付を収集
        const pastDates = dates.filter(date => date < referenceDate);
        if (pastDates.length > 0) {
          issueCount++;
          // 過去の日付を文字列として保存
          pastDates.forEach(date => {
            const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
            if (!pastDatesInfo.includes(formattedDate)) {
              pastDatesInfo.push(formattedDate);
            }
          });
        }
      }

      return issueCount;
    }
  };
}

// 後方互換性のためのデフォルトエクスポート
export const pastDateRule = createPastDateRule();

/**
 * テキストから日付を抽出する関数
 */
function extractDatesFromText(text: string): Date[] {
  const dates: Date[] = [];

  // 日本語形式: 2025年12月3日（水）～15日（金）
  const japanesePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日/g;
  let match;

  while ((match = japanesePattern.exec(text)) !== null) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // Dateオブジェクトでは月は0ベース
    const day = parseInt(match[3]);
    dates.push(new Date(year, month, day));
  }
  // 英語形式: October 2, 2025
  const englishPattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi;
  while ((match = englishPattern.exec(text)) !== null) {
    const monthName = match[1];
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    const month = getMonthFromName(monthName);
    if (month !== -1) {
      dates.push(new Date(year, month, day));
    }
  }
  // 英語形式（範囲）: September 28 - October 1, 2025
  const englishRangePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s*[-–—―]\s*(January|February|March|April|May|June|July|August|September|October|November|December)?\s*(\d{1,2}),?\s+(\d{4})/gi;
  while ((match = englishRangePattern.exec(text)) !== null) {
    const startMonthName = match[1];
    const startDay = parseInt(match[2]);
    const endMonthName = match[3] || startMonthName; // 終了月が省略されている場合は開始月と同じ
    const endDay = parseInt(match[4]);
    const year = parseInt(match[5]);

    const startMonth = getMonthFromName(startMonthName);
    const endMonth = getMonthFromName(endMonthName);

    if (startMonth !== -1) {
      dates.push(new Date(year, startMonth, startDay));
    }
    if (endMonth !== -1) {
      dates.push(new Date(year, endMonth, endDay));
    }
  }

  // 数値形式: 2025/12/3, 2025-12-03
  const numericPattern = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/g;
  while ((match = numericPattern.exec(text)) !== null) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    dates.push(new Date(year, month, day));
  }

  return dates;
}

/**
 * 英語の月名から月番号（0ベース）を取得
 */
function getMonthFromName(monthName: string): number {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  return months.indexOf(monthName.toLowerCase());
}
