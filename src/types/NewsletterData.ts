/**
 * 参加報告のエントリー情報
 */
export interface ReportEntry {
  title: string;
  author: string;
  content: string;
}

/**
 * ニュースレターのデータ構造
 */
export interface NewsletterData {
  // メイン
  publication_year: string;
  no_month: string;
  publication_date: string;
  editor_name: string;
  // 参加報告
  reports: ReportEntry[];
  // 行事
  shusai_kyosai_events: string;
  kyosan_events: string;
  awards: string;
  journal_cfps: string;
  // 関連情報
  international_cfps: string;
  international_conferences: string;
}

/**
 * NewsletterDataの初期値を生成する
 * @param year 発行年 (デフォルトは現在の年)
 * @param month 発行月 (デフォルトは現在の月)
 * @returns NewsletterDataの初期値
 */
export function createInitialNewsletterData(
  year?: string,
  month?: string
): NewsletterData {
  // 年月が指定されていない場合は現在の年月を使用
  const currentDate = new Date();
  const currentYear = year || currentDate.getFullYear().toString();
  const currentMonth = month || (currentDate.getMonth() + 1).toString();

  return {
    // メイン
    publication_year: currentYear,
    no_month: currentMonth,
    publication_date: '25',
    editor_name: '',
    // 参加報告
    reports: [{ title: '', author: '', content: '' }],
    // 行事
    shusai_kyosai_events: '',
    kyosan_events: '',
    awards: '',
    journal_cfps: '',
    // 関連情報
    international_cfps: '',
    international_conferences: ''
  };
}
