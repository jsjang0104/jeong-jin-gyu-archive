import { useEffect, useState } from 'react';
import { getPoems, createPoem, updatePoem, deletePoem, getCollections } from '../../api/archive';
import StatusBlock from '../../components/StatusBlock.jsx';

const empty = { title: '', body: '', year: '', collection: '', is_featured: false, notes: '' };

export default function ManagePoems() {
  const [poems, setPoems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const [p, c] = await Promise.all([getPoems(), getCollections()]);
      setPoems(p);
      setCollections(c);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setValues(empty);
    setFormOpen(true);
  };

  const openEdit = (poem) => {
    setEditingId(poem.id);
    setValues({
      title: poem.title,
      body: poem.body || '',
      year: poem.year || '',
      collection: poem.collection?.id || '',
      is_featured: !!poem.is_featured,
      notes: poem.notes || '',
    });
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    const val = field === 'is_featured' ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      title: values.title,
      body: values.body,
      year: values.year || null,
      collection: values.collection || null,
      is_featured: values.is_featured,
      notes: values.notes,
    };
    try {
      if (editingId) {
        await updatePoem(editingId, payload);
      } else {
        await createPoem(payload);
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
    if (!window.confirm('이 시를 삭제하시겠습니까?')) return;
    try {
      await deletePoem(id);
      await load();
    } catch {
      setNotice({ type: 'error', text: '삭제에 실패했습니다.' });
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <div>
          <span className="eyebrow">Poems</span>
          <h1 className="section-title">시 관리</h1>
        </div>
        <button className="btn" onClick={openCreate}>+ 새 시 등록</button>
      </div>

      {notice && <div className={`notice notice--${notice.type}`}>{notice.text}</div>}

      {formOpen && (
        <form className="manage-panel" onSubmit={handleSubmit}>
          <div className="field">
            <label>제목</label>
            <input type="text" value={values.title} onChange={handleChange('title')} required />
          </div>
          <div className="field">
            <label>본문</label>
            <textarea rows={8} value={values.body} onChange={handleChange('body')} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>연도</label>
              <input type="number" value={values.year} onChange={handleChange('year')} />
            </div>
            <div className="field">
              <label>시집</label>
              <select value={values.collection} onChange={handleChange('collection')}>
                <option value="">— 없음 —</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>해설/출처 메모</label>
            <textarea rows={3} value={values.notes} onChange={handleChange('notes')} />
          </div>
          <label className="checkbox-field">
            <input type="checkbox" checked={values.is_featured} onChange={handleChange('is_featured')} />
            대표 시로 지정 (홈 화면 노출)
          </label>
          <div className="manage-panel__actions">
            <button className="btn" type="submit" disabled={submitting}>{submitting ? '저장 중…' : '저장'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setFormOpen(false)}>취소</button>
          </div>
        </form>
      )}

      {status === 'loading' && <StatusBlock variant="loading" />}
      {status === 'error' && <StatusBlock variant="error" />}
      {status === 'ready' && poems.length === 0 && <StatusBlock variant="empty" />}
      {status === 'ready' && poems.length > 0 && (
        <table className="manage-table">
          <thead><tr><th>제목</th><th>연도</th><th>시집</th><th>대표</th><th></th></tr></thead>
          <tbody>
            {poems.map((poem) => (
              <tr key={poem.id}>
                <td>{poem.title}</td>
                <td>{poem.year || '—'}</td>
                <td>{poem.collection?.title || '—'}</td>
                <td>{poem.is_featured ? '★' : ''}</td>
                <td className="manage-table__actions">
                  <button className="text-link" onClick={() => openEdit(poem)}>수정</button>
                  <button className="text-link" onClick={() => handleDelete(poem.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
