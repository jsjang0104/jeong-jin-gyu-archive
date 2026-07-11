import { useEffect, useState } from 'react';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../../api/archive';
import StatusBlock from '../../components/StatusBlock.jsx';

const empty = { title: '', title_hanja: '', publisher: '', year: '', description: '', order: 0 };

export default function ManageCollections() {
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(empty);
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const data = await getCollections();
      setCollections(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setValues(empty);
    setCoverFile(null);
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setValues({
      title: c.title,
      title_hanja: c.title_hanja || '',
      publisher: c.publisher || '',
      year: c.year || '',
      description: c.description || '',
      order: c.order || 0,
    });
    setCoverFile(null);
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('title_hanja', values.title_hanja || '');
    formData.append('publisher', values.publisher || '');
    if (values.year) formData.append('year', values.year);
    formData.append('description', values.description || '');
    formData.append('order', values.order || 0);
    if (coverFile) formData.append('cover_image', coverFile);
    try {
      if (editingId) {
        await updateCollection(editingId, formData);
      } else {
        await createCollection(formData);
      }
      setFormOpen(false);
      await load();
    } catch {
      setNotice({ type: 'error', text: '저장에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 시집을 삭제하시겠습니까?')) return;
    try {
      await deleteCollection(id);
      await load();
    } catch {
      setNotice({ type: 'error', text: '삭제에 실패했습니다.' });
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <div>
          <span className="eyebrow">Collections</span>
          <h1 className="section-title">시집 관리</h1>
        </div>
        <button className="btn" onClick={openCreate}>+ 새 시집 등록</button>
      </div>

      {notice && <div className={`notice notice--${notice.type}`}>{notice.text}</div>}

      {formOpen && (
        <form className="manage-panel" onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="field">
              <label>제목</label>
              <input type="text" value={values.title} onChange={handleChange('title')} required />
            </div>
            <div className="field">
              <label>한자 제목</label>
              <input type="text" value={values.title_hanja} onChange={handleChange('title_hanja')} />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>발행처</label>
              <input type="text" value={values.publisher} onChange={handleChange('publisher')} />
            </div>
            <div className="field">
              <label>연도</label>
              <input type="number" value={values.year} onChange={handleChange('year')} />
            </div>
          </div>
          <div className="field">
            <label>소개</label>
            <textarea rows={3} value={values.description} onChange={handleChange('description')} />
          </div>
          <div className="field">
            <label>표지 이미지</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </div>
          <div className="manage-panel__actions">
            <button className="btn" type="submit" disabled={submitting}>{submitting ? '저장 중…' : '저장'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setFormOpen(false)}>취소</button>
          </div>
        </form>
      )}

      {status === 'loading' && <StatusBlock variant="loading" />}
      {status === 'error' && <StatusBlock variant="error" />}
      {status === 'ready' && collections.length === 0 && <StatusBlock variant="empty" />}
      {status === 'ready' && collections.length > 0 && (
        <table className="manage-table">
          <thead><tr><th>제목</th><th>연도</th><th>발행처</th><th>수록 시</th><th></th></tr></thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.year || '—'}</td>
                <td>{c.publisher || '—'}</td>
                <td>{c.poem_count}</td>
                <td className="manage-table__actions">
                  <button className="text-link" onClick={() => openEdit(c)}>수정</button>
                  <button className="text-link" onClick={() => handleDelete(c.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
