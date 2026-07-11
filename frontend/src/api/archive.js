import http from './http';

// ---------- public reads ----------
export const getCollections = async () => {
  const { data } = await http.get('/api/collections/');
  return data;
};

export const getCollection = async (id) => {
  const { data } = await http.get(`/api/collections/${id}/`);
  return data;
};

export const getPoems = async (params = {}) => {
  const { data } = await http.get('/api/poems/', { params });
  return data;
};

export const getPoem = async (id) => {
  const { data } = await http.get(`/api/poems/${id}/`);
  return data;
};

export const getArchiveItems = async (params = {}) => {
  const { data } = await http.get('/api/archive-items/', { params });
  return data;
};

export const getArchiveItem = async (id) => {
  const { data } = await http.get(`/api/archive-items/${id}/`);
  return data;
};

export const getTimeline = async () => {
  const { data } = await http.get('/api/timeline/');
  return data;
};

export const getSummary = async () => {
  const { data } = await http.get('/api/summary/');
  return data;
};

// ---------- auth ----------
export const login = async (username, password) => {
  const { data } = await http.post('/api/token/', { username, password });
  return data;
};

// ---------- admin writes: archive items ----------
export const createArchiveItem = async (formData) => {
  const { data } = await http.post('/api/archive-items/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateArchiveItem = async (id, formData) => {
  const { data } = await http.patch(`/api/archive-items/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteArchiveItem = async (id) => {
  await http.delete(`/api/archive-items/${id}/`);
};

export const aiExtract = async (formData) => {
  const { data } = await http.post('/api/ai/extract/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ---------- admin writes: poems ----------
export const createPoem = async (payload) => {
  const { data } = await http.post('/api/poems/', payload);
  return data;
};

export const updatePoem = async (id, payload) => {
  const { data } = await http.patch(`/api/poems/${id}/`, payload);
  return data;
};

export const deletePoem = async (id) => {
  await http.delete(`/api/poems/${id}/`);
};

// ---------- admin writes: collections ----------
export const createCollection = async (formData) => {
  const { data } = await http.post('/api/collections/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateCollection = async (id, formData) => {
  const { data } = await http.patch(`/api/collections/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteCollection = async (id) => {
  await http.delete(`/api/collections/${id}/`);
};

// ---------- admin writes: timeline ----------
export const createTimelineEvent = async (payload) => {
  const { data } = await http.post('/api/timeline/', payload);
  return data;
};

export const updateTimelineEvent = async (id, payload) => {
  const { data } = await http.patch(`/api/timeline/${id}/`, payload);
  return data;
};

export const deleteTimelineEvent = async (id) => {
  await http.delete(`/api/timeline/${id}/`);
};
