import { useState, useEffect } from 'react'
import './App.css'
import TextRules from './components/TextRules'
import TextFormatter, { DEFAULT_FORMAT_SETTINGS, FormatSettings, formatTextForMail } from './components/TextFormatter'

type NewsletterData = {
  title: string;
  author_name: string;
  content: string;
}

type Tab = 'editor' | 'settings' | 'data';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [newsletterData, setNewsletterData] = useState<NewsletterData>({
    title: '',
    author_name: '',
    content: ''
  });
  const [generatedNewsletter, setGeneratedNewsletter] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [formatSettings, setFormatSettings] = useState<FormatSettings>(DEFAULT_FORMAT_SETTINGS);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // ダークモードの設定を読み込む
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }
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

  // ニューズレターテンプレート
  const NEWSLETTER_TEMPLATE = `{title}
{author_name}
{content}
`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextRuleFix = (fixedContent: string) => {
    setNewsletterData(prev => ({
      ...prev,
      content: fixedContent
    }));
  };

  // Webニューズレター生成（整形なし）
  const generateWebNewsletter = () => {
    // テンプレートを解析して各要素を挿入
    let result = NEWSLETTER_TEMPLATE;

    // 各プレースホルダーを対応する値で置換
    Object.entries(newsletterData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(placeholder, value);
    });

    setGeneratedNewsletter(result.trim());
  };

  // テキストメール用ニューズレター生成（整形あり）
  const generateTextNewsletter = () => {
    // テンプレートを解析して各要素を挿入
    let result = NEWSLETTER_TEMPLATE;

    // 各プレースホルダーを対応する値で置換
    Object.entries(newsletterData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(placeholder, value);
    });

    // 行幅整形処理を適用
    result = formatTextForMail(result.trim(), formatSettings);

    setGeneratedNewsletter(result);
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
    const dataStr = JSON.stringify(newsletterData, null, 2);
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
          <div className="main-content">
            <div className="editor-section">
              <section className="input-section">
                <div className="form-group">
                  <label htmlFor="title">タイトル</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newsletterData.title}
                    onChange={handleInputChange}
                    placeholder="ニューズレターのタイトル"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author_name">筆者</label>
                  <input
                    type="text"
                    id="author_name"
                    name="author_name"
                    value={newsletterData.author_name}
                    onChange={handleInputChange}
                    placeholder="所属・氏名"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">本文</label>
                  <textarea
                    id="content"
                    name="content"
                    value={newsletterData.content}
                    onChange={handleInputChange}
                    placeholder="ニューズレターの本文をここに入力してください"
                    rows={10}
                  />
                </div>

                <div className="generation-buttons">
                  <button onClick={generateTextNewsletter} className="text-gen-btn">
                    テキストメール用に生成
                  </button>
                  <button onClick={generateWebNewsletter} className="web-gen-btn">
                    Web用に生成
                  </button>
                </div>
              </section>
            </div>

            <div className="rules-section">
              <section className="input-section">
                <h3>テキスト校正</h3>
                <TextRules
                  text={newsletterData.content}
                  onApplyFix={handleTextRuleFix}
                />
              </section>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-content">
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

      <main>
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
            <h2>生成されたニューズレター</h2>
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
