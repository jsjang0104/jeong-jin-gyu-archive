import { useEffect, useState } from 'react';

const TYPE_OPTIONS = [
  { value: 'MANUSCRIPT', label: '육필' },
  { value: 'ARTIFACT', label: '유품' },
  { value: 'DOCUMENT', label: '문헌' },
  { value: 'PHOTO', label: '사진' },
];

const emptyValues = {
  type: 'MANUSCRIPT',
  title: '',
  date_text: '',
  year: '',
  description: '',
  ocr_text: '',
  source: '네이버 블로그 아카이브',
  related_poem: '',
};

export default function ArchiveItemForm({
  initialValues = {},
  aiFields = [],
  imageFile = null,
  existingImageUrl = null,
  onImageChange,
  onSubmit,
  submitLabel = '등록',
  submitting = false,
}) {
  const [values, setValues] = useState(emptyValues);

  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev };
      Object.keys(emptyValues).forEach((key) => {
        if (key in initialValues) {
          const v = initialValues[key];
          next[key] = v === null || v === undefined ? '' : v;
        }
      });
      return next;
    });
  }, [initialValues]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isAi = (field) => aiFields.includes(field);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', values.type);
    formData.append('title', values.title);
    formData.append('date_text', values.date_text || '');
    if (values.year) formData.append('year', values.year);
    formData.append('description', values.description || '');
    formData.append('ocr_text', values.ocr_text || '');
    formData.append('source', values.source || '');
    if (values.related_poem) formData.append('related_poem', values.related_poem);
    if (imageFile) formData.append('image', imageFile);
    onSubmit(formData);
  };

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {onImageChange && (
        <div className="field">
          <label>이미지 {isAi('image') && <span className="ai-badge">AI 제안</span>}</label>
          <input type="file" accept="image/*" onChange={onImageChange} />
          {(imageFile || existingImageUrl) && (
            <div className="item-form__preview">
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : existingImageUrl}
                alt="미리보기"
              />
            </div>
          )}
        </div>
      )}

      <div className="field">
        <label>유형 {isAi('type') && <span className="ai-badge">AI 제안</span>}</label>
        <select value={values.type} onChange={handleChange('type')}>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>제목 {isAi('title') && <span className="ai-badge">AI 제안</span>}</label>
        <input type="text" value={values.title} onChange={handleChange('title')} required />
      </div>

      <div className="grid grid-2">
        <div className="field">
          <label>연대 표기 {isAi('date_text') && <span className="ai-badge">AI 제안</span>}</label>
          <input type="text" value={values.date_text} onChange={handleChange('date_text')} placeholder="예: 1965. 12" />
        </div>
        <div className="field">
          <label>연도(정렬용) {isAi('year') && <span className="ai-badge">AI 제안</span>}</label>
          <input type="number" value={values.year} onChange={handleChange('year')} />
        </div>
      </div>

      <div className="field">
        <label>설명 {isAi('description') && <span className="ai-badge">AI 제안</span>}</label>
        <textarea rows={3} value={values.description} onChange={handleChange('description')} />
      </div>

      <div className="field">
        <label>판독 텍스트(OCR) {isAi('ocr_text') && <span className="ai-badge">AI 제안</span>}</label>
        <textarea rows={5} value={values.ocr_text} onChange={handleChange('ocr_text')} />
      </div>

      <div className="grid grid-2">
        <div className="field">
          <label>출처</label>
          <input type="text" value={values.source} onChange={handleChange('source')} />
        </div>
        <div className="field">
          <label>관련 시 ID (선택)</label>
          <input type="number" value={values.related_poem} onChange={handleChange('related_poem')} />
        </div>
      </div>

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? '저장 중…' : submitLabel}
      </button>
    </form>
  );
}
