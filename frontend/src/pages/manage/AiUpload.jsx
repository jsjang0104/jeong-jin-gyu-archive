import { useState } from 'react';
import { Link } from 'react-router-dom';
import { aiExtract, createArchiveItem } from '../../api/archive';
import ArchiveItemForm from '../../components/admin/ArchiveItemForm.jsx';

export default function AiUpload() {
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggested, setSuggested] = useState(null);
  const [aiFields, setAiFields] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setSuggested(null);
    setAiFields([]);
    setNotice(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await aiExtract(formData);
      setSuggested(res.suggested);
      setAiFields(Object.keys(res.suggested || {}));
      setIsDemo(!!res.demo);
    } catch {
      setError('AI 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const created = await createArchiveItem(formData);
      setNotice({ text: '자료가 등록되었습니다.', link: `/archive/${created.id}` });
      setImageFile(null);
      setSuggested(null);
      setAiFields([]);
    } catch {
      setNotice({ text: '등록에 실패했습니다.', error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <div>
          <span className="eyebrow">AI Upload</span>
          <h1 className="section-title">AI 자동 등록</h1>
        </div>
      </div>

      <p className="lede">이미지를 올리면 Gemini가 자료 유형과 내용을 읽어 등록 폼을 채워드립니다. 채워진 내용은 자유롭게 수정한 뒤 등록하세요.</p>

      <div
        className={`dropzone ${dragOver ? 'is-dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {imageFile ? (
          <img src={URL.createObjectURL(imageFile)} alt="미리보기" className="dropzone__preview" />
        ) : (
          <span className="eyebrow">이미지를 끌어다 놓거나 선택하세요</span>
        )}
        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      <button className="btn" onClick={handleAnalyze} disabled={!imageFile || analyzing}>
        {analyzing ? '絅山의 글씨를 읽고 있습니다…' : 'AI 분석'}
      </button>

      {error && <p className="notice notice--error">{error}</p>}

      {isDemo && (
        <div className="notice notice--info">
          Gemini API 키가 설정되지 않아 예시 응답입니다.
        </div>
      )}

      {notice && (
        <div className={`notice ${notice.error ? 'notice--error' : 'notice--success'}`}>
          <span>{notice.text}</span>
          {notice.link && <Link to={notice.link} className="text-link">자료 보기</Link>}
        </div>
      )}

      {suggested && (
        <div className="manage-panel">
          <h2 className="section-title">등록 폼</h2>
          <ArchiveItemForm
            initialValues={suggested}
            aiFields={aiFields}
            imageFile={imageFile}
            onImageChange={(e) => handleFile(e.target.files?.[0])}
            onSubmit={handleSubmit}
            submitLabel="등록"
            submitting={submitting}
          />
        </div>
      )}
    </div>
  );
}
