import React from 'react';
import TextRules from './TextRules';
import { NewsletterData, ReportEntry } from '../types/NewsletterData';

import { fullWidthAlphanumericRule } from '../rules/fullWidthAlphanumericRule';
import { paragraphSpacingRule } from '../rules/paragraphSpacingRule';
import { paragraphIndentRule } from '../rules/paragraphIndentRule';
import { punctuationRule } from '../rules/punctuationRule';
import { urlFormatRule } from '../rules/urlFormatRule';
import { parenthesesPairRule } from '../rules/parenthesesPairRule';
import { japaneseParenthesesRule } from '../rules/japaneseParenthesesRule';

export type EditorSubTab = 'main' | 'report' | 'events' | 'info';

interface EditorTabsProps {
  activeEditorSubTab: EditorSubTab;
  setActiveEditorSubTab: (tab: EditorSubTab) => void;
  newsletterData: NewsletterData;
  setNewsletterData: React.Dispatch<React.SetStateAction<NewsletterData>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleReportChange: (index: number, field: keyof ReportEntry, value: string) => void;
  addReport: () => void;
  removeReport: (index: number) => void;
  moveReport: (index: number, direction: 'up' | 'down') => void;
  generateNewsletter: (formatForText?: boolean) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  activeEditorSubTab,
  setActiveEditorSubTab,
  newsletterData,
  setNewsletterData,
  handleInputChange,
  handleReportChange,
  addReport,
  removeReport,
  moveReport,
  generateNewsletter
}) => {
  // エディタサブタブのレンダリング
  const renderEditorSubTab = () => {
    switch (activeEditorSubTab) {
      case 'main':
        return (
          <section className="input-section">
            <h3>基本情報</h3><br />
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
          {newsletterData.reports.map((report, index) => (
            <div key={index} className="form-container">
              <div className="report-header">
                <h3>参加報告 #{index + 1}</h3>
                <div className="report-actions">
                  {newsletterData.reports.length > 1 && (
                    <>
                      <button
                        onClick={() => moveReport(index, 'up')}
                        disabled={index === 0}
                        className="move-btn"
                        aria-label="上に移動"
                      >
                      ↑
                      </button>
                      <button
                        onClick={() => moveReport(index, 'down')}
                        disabled={index === newsletterData.reports.length - 1}
                        className="move-btn"
                        aria-label="下に移動"
                      >
                      ↓
                      </button>
                      <button
                        onClick={() => removeReport(index)}
                          className="remove-btn"
                          aria-label="削除"
                        >
                        ×
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor={`report-title-${index}`}>タイトル</label>
                <input
                  type="text"
                  id={`report-title-${index}`}
                  value={report.title}
                  onChange={(e) => handleReportChange(index, 'title', e.target.value)}
                  placeholder="参加報告のタイトル"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`report-author-${index}`}>筆者</label>
                <input
                  type="text"
                  id={`report-author-${index}`}
                  value={report.author}
                  onChange={(e) => handleReportChange(index, 'author', e.target.value)}
                  placeholder="所属・氏名"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`report-content-${index}`}>本文</label>
                <textarea
                  id={`report-content-${index}`}
                  value={report.content}
                  onChange={(e) => handleReportChange(index, 'content', e.target.value)}
                  placeholder="参加報告の本文をここに入力してください"
                  rows={10}
                />
              </div>

              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.reports[index]?.content ?? ''}
                  rules={[
                    fullWidthAlphanumericRule,
                    paragraphSpacingRule,
                    paragraphIndentRule,
                    punctuationRule,
                    urlFormatRule,
                    parenthesesPairRule,
                    japaneseParenthesesRule
                  ]}
                  onApplyFix={(fixedContent: string) => {
                      setNewsletterData(prev => {
                        const newReports = [...prev.reports];
                        if (newReports[index]) {
                          newReports[index] = { ...newReports[index], content: fixedContent };
                        }
                        return { ...prev, reports: newReports };
                      });
                    }
                  }
                />
              </div>

              <button onClick={addReport} className="add-report-btn">
                + 参加報告を追加
              </button>
            </div>
          ))}
          </section>
        );
      case 'events':
        return (
          <section className="input-section">
            <h3>行事情報</h3><br />
            <div className="form-group form-container">
              <label htmlFor="shusai_kyosai_events">主催・共催行事</label>
              <textarea
                id="shusai_kyosai_events"
                name="shusai_kyosai_events"
                value={newsletterData.shusai_kyosai_events}
                onChange={handleInputChange}
                placeholder="主催・共催行事の情報をここに入力してください"
                rows={6}
              />
              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.shusai_kyosai_events}
                  rules={[fullWidthAlphanumericRule, punctuationRule, urlFormatRule, parenthesesPairRule, japaneseParenthesesRule]}
                  onApplyFix={(fixedContent: string) => {
                    setNewsletterData(prev => ({...prev, shusai_kyosai_events: fixedContent}));
                  }}
                />
              </div>
            </div>

            <div className="form-group form-container">
              <label htmlFor="kyosan_events">協賛行事</label>
              <textarea
                id="kyosan_events"
                name="kyosan_events"
                value={newsletterData.kyosan_events}
                onChange={handleInputChange}
                placeholder="協賛行事の情報をここに入力してください"
                rows={6}
              />
              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.kyosan_events}
                  rules={[fullWidthAlphanumericRule, punctuationRule, urlFormatRule, parenthesesPairRule, japaneseParenthesesRule]}
                  onApplyFix={(fixedContent: string) => {
                    setNewsletterData(prev => ({...prev, kyosan_events: fixedContent}));
                  }}
                />
              </div>
            </div>

            <div className="form-group form-container">
              <label htmlFor="awards">賞に関するご案内</label>
              <textarea
                id="awards"
                name="awards"
                value={newsletterData.awards}
                onChange={handleInputChange}
                placeholder="賞に関するご案内の情報をここに入力してください"
                rows={6}
              />
              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.awards}
                  rules={[fullWidthAlphanumericRule, punctuationRule, urlFormatRule, parenthesesPairRule, japaneseParenthesesRule]}
                  onApplyFix={(fixedContent: string) => {
                    setNewsletterData(prev => ({...prev, awards: fixedContent}));
                  }}
                />
              </div>
            </div>
          </section>
        );
      case 'info':
        return (
          <section className="input-section">
            <h3>関連情報</h3><br />
            <div className="form-group form-container">
              <label htmlFor="journal_cfps">論文誌特集号</label>
              <textarea
                id="journal_cfps"
                name="journal_cfps"
                value={newsletterData.journal_cfps}
                onChange={handleInputChange}
                placeholder="論文誌の特集号情報をここに入力してください"
                rows={5}
              />
              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.journal_cfps}
                  rules={[fullWidthAlphanumericRule, punctuationRule, urlFormatRule, parenthesesPairRule, japaneseParenthesesRule]}
                  onApplyFix={(fixedContent: string) => {
                    setNewsletterData(prev => ({...prev, journal_cfps: fixedContent}));
                  }}
                />
              </div>
            </div>

            <div className="form-group form-container">
              <label htmlFor="international_cfps">国際会議論文募集</label>
              <textarea
                id="international_cfps"
                name="international_cfps"
                value={newsletterData.international_cfps}
                onChange={handleInputChange}
                placeholder="国際会議の論文募集情報をここに入力してください"
                rows={5}
              />
              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.international_cfps}
                  rules={[fullWidthAlphanumericRule, punctuationRule, urlFormatRule, parenthesesPairRule, japaneseParenthesesRule]}
                  onApplyFix={(fixedContent: string) => {
                    setNewsletterData(prev => ({...prev, international_cfps: fixedContent}));
                  }}
                />
              </div>
            </div>

            <div className="form-group form-container">
              <label htmlFor="international_conferences">国際会議参加募集</label>
              <textarea
                id="international_conferences"
                name="international_conferences"
                value={newsletterData.international_conferences}
                onChange={handleInputChange}
                placeholder="国際会議の参加募集情報をここに入力してください"
                rows={5}
              />
              <div className="rules-section-inline">
                <TextRules
                  text={newsletterData.international_conferences}
                  rules={[fullWidthAlphanumericRule, punctuationRule, urlFormatRule, parenthesesPairRule, japaneseParenthesesRule]}
                  onApplyFix={(fixedContent: string) => {
                    setNewsletterData(prev => ({...prev, international_conferences: fixedContent}));
                  }}
                />
              </div>
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
