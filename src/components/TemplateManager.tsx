import { useState, useEffect } from 'react';
import defaultTemplate from '../assets/templates/newsletter.txt?raw';

export type Template = {
  id: string;
  name: string;
  content: string;
};

type TemplateManagerProps = {
  onTemplateChange: (template: string) => void;
};

const TemplateManager = ({ onTemplateChange }: TemplateManagerProps) => {
  // setTemplatesは現在使用していませんが、将来的にテンプレートの追加や編集機能のために残しています
  const [templates] = useState<Template[]>([
    {
      id: 'default',
      name: '標準テンプレート',
      content: defaultTemplate
    }
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');

  // テンプレートが変更されたときに親コンポーネントに通知
  useEffect(() => {
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (selectedTemplate) {
      onTemplateChange(selectedTemplate.content);
    }
  }, [selectedTemplateId, templates, onTemplateChange]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateId(e.target.value);
  };

  return (
    <div className="template-manager">
      <div className="form-group">
        <label htmlFor="template-select">テンプレート</label>
        <select
          id="template-select"
          value={selectedTemplateId}
          onChange={handleTemplateChange}
          className="template-select"
        >
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TemplateManager; 
