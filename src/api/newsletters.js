import client from './client';
export const getNewsletters = () => client.get('/api/newsletters');
export const createNewsletter = (data) => client.post('/api/newsletters', data);
export const sendNewsletter = (id) => client.post(`/api/newsletters/${id}/send`);
export const deleteNewsletter = (id) => client.delete(`/api/newsletters/${id}`);
