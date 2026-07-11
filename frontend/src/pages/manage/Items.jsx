import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getArchiveItems,
  getArchiveItem,
  createArchiveItem,
  updateArchiveItem,
  deleteArchiveItem,
} from '../../api/archive';
import ArchiveItemForm from '../../components/admin/ArchiveItemForm.jsx';
import PlaceholderImage from '../../components/PlaceholderImage.jsx';
import StatusBlock from '../../components/StatusBlock.jsx';

const TYPE_LABEL = { MANUSCRIPT: '육필', ARTIFACT: '유품', DOCUMENT: '문헌', PHOTO: '사진' };

export default function ManageItems() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const data = await getArchiveItems();
      setItems(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    setFormOpen(true);
  };

  const openEdit = async (item) => {
    try {
      const detail = await getArchiveItem(item.id);
      setEditing({ ...detail, related_poem: detail.related_poem?.id || '' });
      setImageFile(null);
      setFormOpen(true);
    } catch {
      setNotice({ type: 'error', text: '자료를 불러올 수 없습니다.' });
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateArchiveItem(editing.id, formData);
        setNotice({ type: 'success', text: '자료가 수정되었습니다.' });
      } else {
        const created = await createArchiveItem(formData);
        setNotice({ type: 'success', text: '자료가 등록되었습니다.', link: `/archive/${created.id}` });
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch {
      setNotice({ type: 'error', text: '저장에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 자료를 삭제하시겠습니까?')) return;
    try {
      await deleteArchiveItem(id);
      await load();
    } catch {
      setNotice({ type: 'error', text: '삭제에 실패했습니다.' });
    }
  };

  return (
    <div className="manage-page">
      <div className="manage-page__header">
        <div>
          <span className="eyebrow">Archive Items</span>
          <h1 className="section-title">아카이브 자료</h1>
        </div>
        <button className="btn" onClick={openCreate}>+ 새 자료 등록</button>
      </div>

      {notice && (
        <div className={`notice notice--${notice.type}`}>
          <span>{notice.text}</span>
          {notice.link && <Link to={notice.link} className="text-link">자료 보기</Link>}
        </div>
      )}

      {formOpen && (
        <div className="manage-panel">
          <h2 className="section-title">{editing ? '자료 수정' : '새 자료 등록'}</h2>
          <ArchiveItemForm
            initialValues={editing || {}}
            existingImageUrl={editing?.image}
            imageFile={imageFile}
            onImageChange={(e) => setImageFile(e.target.files?.[0] || null)}
            onSubmit={handleSubmit}
            submitLabel={editing ? '수정 저장' : '등록'}
            submitting={submitting}
          />
          <button className="btn btn-ghost btn-small" onClick={() => setFormOpen(false)}>취소</button>
        </div>
      )}

      {status === 'loading' && <StatusBlock variant="loading" />}
      {status === 'error' && <StatusBlock variant="error" />}
      {status === 'ready' && items.length === 0 && <StatusBlock variant="empty" />}

      {status === 'ready' && items.length > 0 && (
        <table className="manage-table">
          <thead>
            <tr><th></th><th>제목</th><th>유형</th><th>연대</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="manage-table__thumb">
                  {item.image ? <img src={item.image} alt="" /> : <PlaceholderImage title={item.title} />}
                </td>
                <td>{item.title}</td>
                <td>{TYPE_LABEL[item.type] || item.type_display}</td>
                <td>{item.date_text || item.year || '—'}</td>
                <td className="manage-table__actions">
                  <button className="text-link" onClick={() => openEdit(item)}>수정</button>
                  <button className="text-link" onClick={() => handleDelete(item.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
