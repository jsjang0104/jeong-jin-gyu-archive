import { useEffect, useState } from 'react';
import { getTimeline, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from '../../api/archive';
import StatusBlock from '../../components/StatusBlock.jsx';

const empty = { year: '', month: '', title: '', description: '' };

export default function ManageTimeline() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const data = await getTimeline();
      setEvents(data);
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

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setValues({ year: ev.year, month: ev.month || '', title: ev.title, description: ev.description || '' });
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      year: values.year,
      month: values.month || null,
      title: values.title,
      description: values.description,
    };
    try {
      if (editingId) {
        await updateTimelineEvent(editingId, payload);
      } else {
        await createTimelineEvent(payload);
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
    if (!window.confirm('이 연보 항목을 삭제하시겠습니까?')) return;
    try {
      await deleteTimelineEvent(id);
      await load();
    } catch {
      setNotice({ type: 'error', text: '삭제에 실패했습니다.' });
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <div>
          <span className="eyebrow">Timeline</span>
          <h1 className="section-title">연보 관리</h1>
        </div>
        <button className="btn" onClick={openCreate}>+ 새 연보 등록</button>
      </div>

      {notice && <div className={`notice notice--${notice.type}`}>{notice.text}</div>}

      {formOpen && (
        <form className="manage-panel" onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="field">
              <label>연도</label>
              <input type="number" value={values.year} onChange={handleChange('year')} required />
            </div>
            <div className="field">
              <label>월 (선택)</label>
              <input type="number" min="1" max="12" value={values.month} onChange={handleChange('month')} />
            </div>
          </div>
          <div className="field">
            <label>제목</label>
            <input type="text" value={values.title} onChange={handleChange('title')} required />
          </div>
          <div className="field">
            <label>설명</label>
            <textarea rows={3} value={values.description} onChange={handleChange('description')} />
          </div>
          <div className="manage-panel__actions">
            <button className="btn" type="submit" disabled={submitting}>{submitting ? '저장 중…' : '저장'}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setFormOpen(false)}>취소</button>
          </div>
        </form>
      )}

      {status === 'loading' && <StatusBlock variant="loading" />}
      {status === 'error' && <StatusBlock variant="error" />}
      {status === 'ready' && events.length === 0 && <StatusBlock variant="empty" />}
      {status === 'ready' && events.length > 0 && (
        <table className="manage-table">
          <thead><tr><th>연도</th><th>월</th><th>제목</th><th></th></tr></thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.year}</td>
                <td>{ev.month || '—'}</td>
                <td>{ev.title}</td>
                <td className="manage-table__actions">
                  <button className="text-link" onClick={() => openEdit(ev)}>수정</button>
                  <button className="text-link" onClick={() => handleDelete(ev.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
