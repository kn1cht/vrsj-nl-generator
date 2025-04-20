import { useState } from 'react';
import chairDefaultContent from '../assets/templates/chair.txt?raw';
import committeeDefaultContent from '../assets/templates/committee.txt?raw';

type TemplateSettingsProps = {
  chairContent: string;
  committeeContent: string;
  onChairChange: (content: string) => void;
  onCommitteeChange: (content: string) => void;
};

const TemplateSettings: React.FC<TemplateSettingsProps> = ({
  chairContent,
  committeeContent,
  onChairChange,
  onCommitteeChange
}) => {
  const [chair, setChair] = useState(chairContent || chairDefaultContent);
  const [committee, setCommittee] = useState(committeeContent || committeeDefaultContent);

  const handleChairChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChair(e.target.value);
    onChairChange(e.target.value);
  };

  const handleCommitteeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommittee(e.target.value);
    onCommitteeChange(e.target.value);
  };

  const resetToDefault = () => {
    setChair(chairDefaultContent);
    setCommittee(committeeDefaultContent);
    onChairChange(chairDefaultContent);
    onCommitteeChange(committeeDefaultContent);
  };

  return (
    <div className="settings-panel">
      <h3>テンプレート設定</h3>
      <div className="form-group">
        <label htmlFor="chair">委員長</label>
        <input
          type="text"
          id="chair"
          value={chair}
          onChange={handleChairChange}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="committee">委員会メンバー</label>
        <textarea
          id="committee"
          value={committee}
          onChange={handleCommitteeChange}
          rows={8}
          className="form-control"
        />
      </div>

      <button
        onClick={resetToDefault}
        className="settings-reset-btn"
      >
        デフォルト値に戻す
      </button>
    </div>
  );
};

export default TemplateSettings;
