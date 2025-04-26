import { NewsletterData, ReportEntry } from '../types/NewsletterData';
import { FormatSettings } from '../components/TextFormatter';

export interface TemplateVariables {
  chair: string;
  committee: string;
}

export class TemplateService {
  constructor(
    private defaultTemplate: string,
    private awardTocTemplate: string,
    private awardTemplate: string,
    private templateVars: TemplateVariables
  ) {}

  /**
   * ニュースレターのテキストを生成する
   */
  public generateNewsletter(
    newsletterData: NewsletterData,
    formatTextFunction?: (text: string, settings: FormatSettings) => string,
    formatSettings?: FormatSettings
  ): string {
    if (!this.defaultTemplate) {
      throw new Error('テンプレートが読み込まれていません');
    }

    let result = this.defaultTemplate;

    // 賞に関するご案内の処理
    if (!newsletterData.awards || newsletterData.awards.trim() === '') {
      // 入力がない場合は、対応する行を削除
      result = this.removeEmptyAwardLines(result);
    }

    // トップレベル項目を置換
    const replacements = this.createReplacements(newsletterData);

    // 各プレースホルダーを対応する値で置換
    result = this.replaceAllPlaceholders(result, replacements);

    // Vol値を計算して置換（publication_year - 1995）
    result = this.replaceVolPlaceholder(result, newsletterData.publication_year);

    // テンプレート変数の設定
    result = this.replaceTemplateVariables(result);

    // テキストメール用の場合は行幅整形処理を適用
    if (formatTextFunction && formatSettings) {
      result = formatTextFunction(result.trim(), formatSettings);
    } else {
      result = result.trim();
    }

    return result;
  }

  /**
   * 空の賞情報を含む行を削除する
   */
  private removeEmptyAwardLines(template: string): string {
    // award_toc を含む行を削除
    let result = template.replace(/^.*\$\{award_toc\}.*$\n?/gm, '');
    // award を含む行を削除（複数行に渡る場合もあるので全てを削除）
    result = result.replace(/^.*\$\{award\}.*$[\s\S]*?\n(?=\S)/gm, '');
    return result;
  }

  /**
   * 目次部分の参加報告タイトルと筆者を生成
   */
  private generateReportTitlesForToc(reports: ReportEntry[]): string {
    let reportTitlesForToc = '';
    reports.forEach((report, index) => {
      if (index > 0) reportTitlesForToc += '\n';
      reportTitlesForToc += `　◆ ${report.title}\n　　${report.author}`;
    });
    return reportTitlesForToc;
  }

  /**
   * 報告集部分の内容を生成
   */
  private generateReportContents(reports: ReportEntry[]): string {
    let reportContents = '';
    reports.forEach((report, index) => {
      if (index > 0) reportContents += '\n\n';
      reportContents += `＋----------------------------------------------------------------------＋\n`;
      reportContents += `｜◆ ${report.title}\n`;
      reportContents += `＋----------------------------------------------------------------------＋\n`;
      reportContents += `${report.author}\n`;
      reportContents += `${report.content}`;
    });
    return reportContents;
  }

  /**
   * 賞に関するご案内の処理
   */
  private processAward(awards: string): { awardToc: string, awardContent: string } {
    let awardToc = '';
    let awardContent = '';
    if (awards && awards.trim() !== '') {
      // 目次部分
      awardToc = this.awardTocTemplate;
      // 本文部分
      awardContent = this.awardTemplate.replace('${content}', awards);
    }
    return { awardToc, awardContent };
  }

  /**
   * 置換用オブジェクトを作成
   */
  private createReplacements(newsletterData: NewsletterData): Record<string, string> {
    const reportTitlesForToc = this.generateReportTitlesForToc(newsletterData.reports);
    const reportContents = this.generateReportContents(newsletterData.reports);
    const { awardToc, awardContent } = this.processAward(newsletterData.awards);

    return {
      // 通常のフィールド
      publication_year: newsletterData.publication_year,
      no_month: newsletterData.no_month,
      editor_name: newsletterData.editor_name,
      shusai_kyosai_events: newsletterData.shusai_kyosai_events,
      kyosan_events: newsletterData.kyosan_events,
      journal_cfps: newsletterData.journal_cfps,
      international_cfps: newsletterData.international_cfps,
      international_conferences: newsletterData.international_conferences,

      // 参加報告関連の特別フィールド
      report_title_list: reportTitlesForToc,
      report_contents: reportContents,

      // 賞に関するご案内
      award_toc: awardToc,
      award: awardContent
    };
  }

  /**
   * すべてのプレースホルダーを対応する値で置換
   */
  private replaceAllPlaceholders(template: string, replacements: Record<string, string>): string {
    let result = template;
    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(placeholder, value.trim());
    });
    return result;
  }

  /**
   * Vol値を計算して置換
   */
  private replaceVolPlaceholder(template: string, publicationYearStr: string): string {
    const publicationYear = parseInt(publicationYearStr);
    if (!isNaN(publicationYear)) {
      const vol = publicationYear - 1995;
      const volPlaceholder = new RegExp('\\$\\{vol\\}', 'g');
      return template.replace(volPlaceholder, vol.toString());
    }
    return template;
  }

  /**
   * テンプレート変数を置換
   */
  private replaceTemplateVariables(template: string): string {
    let result = template;
    Object.entries(this.templateVars).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(placeholder, value.trim());
    });
    return result;
  }
}
