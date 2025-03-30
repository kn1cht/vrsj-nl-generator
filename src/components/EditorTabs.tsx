import React from 'react';
import TextRules from './TextRules';

export type NewsletterData = {
  // メイン
  publication_year: string;
  no_month: string;
  editor_name: string;

  // 参加報告
  report_title: string;
  report_author_name: string;
  report_content: string;

  // 行事
  shusai_kyosai_events: string;
  kyosan_events: string;

  // 関連情報
  journal_cfps: string;
  international_cfps: string;
  international_conferences: string;
}

export type EditorSubTab = 'main' | 'report' | 'events' | 'info';

interface EditorTabsProps {
  activeEditorSubTab: EditorSubTab;
  setActiveEditorSubTab: (tab: EditorSubTab) => void;
  newsletterData: NewsletterData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTextRuleFix: (fixedContent: string) => void;
  generateNewsletter: (formatForText: boolean) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  activeEditorSubTab,
  setActiveEditorSubTab,
  newsletterData,
  handleInputChange,
  handleTextRuleFix,
  generateNewsletter
}) => {
  // エディタサブタブのレンダリング
  const renderEditorSubTab = () => {
    switch (activeEditorSubTab) {
      case 'main':
        return (
          <section className="input-section">
            <h3>基本情報</h3>
            <div className="form-group">
              <label htmlFor="publication_year">年</label>
              <input
                type="text"
                id="publication_year"
                name="publication_year"
                value={newsletterData.publication_year}
                onChange={handleInputChange}
                placeholder="西暦年号"
              />
              <small className="form-help">
                Volは発行年から自動計算されます（Vol = 発行年 - 1995）
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="no_month">月</label>
              <input
                type="text"
                id="no_month"
                name="no_month"
                value={newsletterData.no_month}
                onChange={handleInputChange}
                placeholder="月"
              />
            </div>

            <div className="form-group">
              <label htmlFor="editor_name">編集担当者</label>
              <input
                type="text"
                id="editor_name"
                name="editor_name"
                value={newsletterData.editor_name}
                onChange={handleInputChange}
                placeholder="編集担当者名"
              />
            </div>
          </section>
        );
      case 'report':
        return (
          <section className="input-section">
            <h3>参加報告</h3>
            <div className="form-group">
              <label htmlFor="report_title">タイトル</label>
              <input
                type="text"
                id="report_title"
                name="report_title"
                value={newsletterData.report_title}
                onChange={handleInputChange}
                placeholder="ニューズレターのタイトル"
              />
            </div>

            <div className="form-group">
              <label htmlFor="report_author_name">筆者</label>
              <input
                type="text"
                id="report_author_name"
                name="report_author_name"
                value={newsletterData.report_author_name}
                onChange={handleInputChange}
                placeholder="所属・氏名"
              />
            </div>

            <div className="form-group">
              <label htmlFor="report_content">本文</label>
              <textarea
                id="report_content"
                name="report_content"
                value={newsletterData.report_content}
                onChange={handleInputChange}
                placeholder="ニューズレターの本文をここに入力してください"
                rows={10}
              />
            </div>

            <div className="rules-section-inline">
              <h3>テキスト校正</h3>
              <TextRules
                text={newsletterData.report_content}
                onApplyFix={handleTextRuleFix}
              />
            </div>
          </section>
        );
      case 'events':
        return (
          <section className="input-section">
            <h3>行事情報</h3>
            <div className="form-group">
              <label htmlFor="shusai_kyosai_events">主催・共催行事</label>
              <textarea
                id="shusai_kyosai_events"
                name="shusai_kyosai_events"
                value={newsletterData.shusai_kyosai_events}
                onChange={handleInputChange}
                placeholder="主催・共催行事の情報をここに入力してください"
                rows={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="kyosan_events">協賛行事</label>
              <textarea
                id="kyosan_events"
                name="kyosan_events"
                value={newsletterData.kyosan_events}
                onChange={handleInputChange}
                placeholder="協賛行事の情報をここに入力してください"
                rows={6}
              />
            </div>
          </section>
        );
      case 'info':
        return (
          <section className="input-section">
            <h3>関連情報</h3>
            <div className="form-group">
              <label htmlFor="journal_cfps">論文誌特集号</label>
              <textarea
                id="journal_cfps"
                name="journal_cfps"
                value={newsletterData.journal_cfps}
                onChange={handleInputChange}
                placeholder="論文誌の特集号情報をここに入力してください"
                rows={5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="international_cfps">国際会議論文募集</label>
              <textarea
                id="international_cfps"
                name="international_cfps"
                value={newsletterData.international_cfps}
                onChange={handleInputChange}
                placeholder="国際会議の論文募集情報をここに入力してください"
                rows={5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="international_conferences">国際会議参加募集</label>
              <textarea
                id="international_conferences"
                name="international_conferences"
                value={newsletterData.international_conferences}
                onChange={handleInputChange}
                placeholder="国際会議の参加募集情報をここに入力してください"
                rows={5}
              />
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      <div className="editor-section">
        <div className="editor-subtabs">
          <button
            className={`editor-subtab ${activeEditorSubTab === 'main' ? 'active' : ''}`}
            onClick={() => setActiveEditorSubTab('main')}
          >
            基本情報
          </button>
          <button
            className={`editor-subtab ${activeEditorSubTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveEditorSubTab('report')}
          >
            参加報告
          </button>
          <button
            className={`editor-subtab ${activeEditorSubTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveEditorSubTab('events')}
          >
            行事情報
          </button>
          <button
            className={`editor-subtab ${activeEditorSubTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveEditorSubTab('info')}
          >
            関連情報
          </button>
        </div>

        <div className="editor-content">
          {renderEditorSubTab()}
        </div>

        <div className="action-panel">
          <div className="generation-buttons">
            <button onClick={() => generateNewsletter(true)} className="text-gen-btn">
              テキストメール用に生成
            </button>
            <button onClick={() => generateNewsletter(false)} className="web-gen-btn">
              Web用に生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorTabs;
