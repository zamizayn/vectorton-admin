import client from './client';
export const getSeoRecords = () => client.get('/api/seo');
export const getSeoRecord = (id) => client.get(`/api/seo/${id}`);
export const createSeoRecord = (data) => client.post('/api/seo', data);
export const updateSeoRecord = (id, data) => client.put(`/api/seo/${id}`, data);
export const deleteSeoRecord = (id) => client.delete(`/api/seo/${id}`);
