import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Timeline from './pages/Timeline.jsx';
import Collections from './pages/Collections.jsx';
import CollectionDetail from './pages/CollectionDetail.jsx';
import Poems from './pages/Poems.jsx';
import PoemDetail from './pages/PoemDetail.jsx';
import Archive from './pages/Archive.jsx';
import ArchiveDetail from './pages/ArchiveDetail.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './components/admin/AdminLayout.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import Login from './pages/manage/Login.jsx';
import Dashboard from './pages/manage/Dashboard.jsx';
import ManageItems from './pages/manage/Items.jsx';
import AiUpload from './pages/manage/AiUpload.jsx';
import ManagePoems from './pages/manage/Poems.jsx';
import ManageCollections from './pages/manage/Collections.jsx';
import ManageTimeline from './pages/manage/Timeline.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/poems" element={<Poems />} />
        <Route path="/poems/:id" element={<PoemDetail />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/archive/:id" element={<ArchiveDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/manage/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/manage" element={<Dashboard />} />
        <Route path="/manage/items" element={<ManageItems />} />
        <Route path="/manage/ai-upload" element={<AiUpload />} />
        <Route path="/manage/poems" element={<ManagePoems />} />
        <Route path="/manage/collections" element={<ManageCollections />} />
        <Route path="/manage/timeline" element={<ManageTimeline />} />
      </Route>
    </Routes>
  );
}
