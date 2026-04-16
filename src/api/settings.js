import client from './client';

export const getSettings = () => client.get('/api/settings');
export const updateSettings = (updates) => client.put('/api/settings', updates);
