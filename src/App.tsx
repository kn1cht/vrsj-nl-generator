import { useState, useEffect } from 'react'
import './App.css'
import TextFormatter, { DEFAULT_FORMAT_SETTINGS, FormatSettings, formatTextForMail } from './components/TextFormatter'
import TemplateSettings from './components/TemplateSettings'
import EditorTabs, { EditorSubTab } from './components/EditorTabs'
import { NewsletterData, ReportEntry, createInitialNewsletterData } from './types/NewsletterData'
import defaultTemplate from './assets/templates/newsletter.txt?raw'
import chairDefaultContent from './assets/templates/chair.txt?raw'
import committeeDefaultContent from './assets/templates/committee.txt?raw'
import awardTocTemplate from './assets/templates/award_toc.txt?raw'
import awardTemplate from './assets/templates/award.txt?raw'
import shusaiKyosaiEventsTocTemplate from './assets/templates/shusai_kyosai_events_toc.txt?raw'
import shusaiKyosaiEventsTemplate from './assets/templates/shusai_kyosai_events.txt?raw'
import { TemplateService } from './services/TemplateService'

type Tab = 'editor' | 'settings' | 'data';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [activeEditorSubTab, setActiveEditorSubTab] = useState<EditorSubTab>('main');

  const [newsletterData, setNewsletterData] = useState<NewsletterData>(createInitialNewsletterData());

  const [generatedNewsletter, setGeneratedNewsletter] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [formatSettings, setFormatSettings] = useState<FormatSettings>(DEFAULT_FORMAT_SETTINGS);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [chairContent, setChairContent] = useState(chairDefaultContent);
  const [committeeContent, setCommitteeContent] = useState(committeeDefaultContent);

  // テンプレートサービスの初期化
  const templateService = new TemplateService(
    defaultTemplate,
    awardTocTemplate,
    awardTemplate,
    shusaiKyosaiEventsTocTemplate,
    shusaiKyosaiEventsTemplate,
    { chair: chairContent, committee: committeeContent }
  );

  // ダークモードの設定を読み込む
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode !== null) {
      // ローカルストレージに設定が保存されている場合はそれを優先
      const isDarkMode = savedMode === 'true';
      setDarkMode(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
      }
    } else {
      // ローカルストレージに設定がない場合はOSの設定に従う
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark-mode');
      }
    }

    // OS設定の変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // ローカルストレージに設定がない場合のみOS設定に従う
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark-mode');
        } else {
          document.documentElement.classList.remove('dark-mode');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ダークモードの切り替え
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }

    localStorage.setItem('darkMode', String(newMode));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 参加報告のフィールド変更ハンドラー
  const handleReportChange = (index: number, field: keyof ReportEntry, value: string) => {
    setNewsletterData(prev => {
      const newReports = [...prev.reports];
      newReports[index] = { ...newReports[index], [field]: value };
      return { ...prev, reports: newReports };
    });
  };

  // 参加報告を追加
  const addReport = () => {
    setNewsletterData(prev => ({
      ...prev,
      reports: [...prev.reports, { title: '', author: '', content: '' }]
    }));
  };

  // 参加報告を削除
  const removeReport = (index: number) => {
    if (newsletterData.reports.length <= 1) return; // 少なくとも1つは必要

    setNewsletterData(prev => {
      const newReports = [...prev.reports];
      newReports.splice(index, 1);
      return { ...prev, reports: newReports };
    });
  };

  // 参加報告を移動（上下）
  const moveReport = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === newsletterData.reports.length - 1)
    ) {
      return; // 境界チェック
    }

    setNewsletterData(prev => {
      const newReports = [...prev.reports];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      // 要素の入れ替え
      [newReports[index], newReports[newIndex]] = [newReports[newIndex], newReports[index]];

      return { ...prev, reports: newReports };
    });
  };

  // ニューズレター生成の共通関数
  const generateNewsletter = (formatForText = false) => {
    try {
      let result;
      if (formatForText) {
        result = templateService.generateNewsletter(
          newsletterData,
          formatTextForMail,
          formatSettings
        );
      } else {
        result = templateService.generateNewsletter(newsletterData);
      }
      setGeneratedNewsletter(result);
    } catch (error) {
      console.error('ニューズレターの生成に失敗しました', error);
      alert('ニューズレターの生成に失敗しました。テンプレートを確認してください。');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedNewsletter);
    setIsCopied(true);

    // 3秒後に元の状態に戻す
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const exportToJson = () => {
    const exportData = {
      ...newsletterData,
      template_chair: chairContent,
      template_committee: committeeContent
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `newsletter-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target && typeof e.target.result === 'string') {
          try {
            const imported = JSON.parse(e.target.result) as NewsletterData;
            setNewsletterData(imported);
            if (imported.template_chair) {
              setChairContent(imported.template_chair);
            }
            if (imported.template_committee) {
              setCommitteeContent(imported.template_committee);
            }
          } catch (error) {
            console.error('JSONファイルの解析エラー:', error);
            alert('JSONファイルの解析に失敗しました。');
          }
        }
      };
    }
  };

  // タブコンテンツのレンダリング
  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <EditorTabs
            activeEditorSubTab={activeEditorSubTab}
            setActiveEditorSubTab={setActiveEditorSubTab}
            newsletterData={newsletterData}
            setNewsletterData={setNewsletterData}
            handleInputChange={handleInputChange}
            handleReportChange={handleReportChange}
            addReport={addReport}
            removeReport={removeReport}
            moveReport={moveReport}
            generateNewsletter={generateNewsletter}
          />
        );
      case 'settings':
        return (
          <div className="settings-container">
            <TemplateSettings
              chairContent={chairContent}
              committeeContent={committeeContent}
              onChairChange={setChairContent}
              onCommitteeChange={setCommitteeContent}
            />
            <TextFormatter
              settings={formatSettings}
              onSettingsChange={setFormatSettings}
            />
          </div>
        );
      case 'data':
        return (
          <div className="data-section">
            <button onClick={exportToJson} className="export-btn">JSONとしてエクスポート</button>
            <label className="import-btn">
              JSONをインポート
              <input
                type="file"
                accept=".json"
                onChange={importFromJson}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  // 生成したニューズレターをクリアする
  const clearGeneratedNewsletter = () => {
    setGeneratedNewsletter('');
  };

  return (
    <div className="app-container">
      <header>
        <h1>VRSJ ニューズレタージェネレーター</h1>
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="main-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            エディタ
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            設定
          </button>
          <button
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            データ
          </button>
        </div>

        {renderTabContent()}

        {generatedNewsletter && (
          <section className="output-section">
            <div className="output-header">
              <h2>生成されたニューズレター</h2>
              <button
                onClick={clearGeneratedNewsletter}
                className="clear-btn"
                aria-label="クリア"
              >
                ✕
              </button>
            </div>
            <div className="newsletter-preview">
              <button
                onClick={copyToClipboard}
                className={`copy-button ${isCopied ? 'copied' : ''}`}
              >
                {isCopied ? (
                  <>
                    <span className="copy-icon">✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span className="copy-icon">📋</span>
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre>{generatedNewsletter}</pre>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
