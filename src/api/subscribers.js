import client from './client';
export const getSubscribers = () => client.get('/api/subscribers');
export const deleteSubscriber = (id) => client.delete(`/api/subscribers/${id}`);
