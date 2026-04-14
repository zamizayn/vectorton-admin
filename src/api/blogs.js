import client from './client';
export const getBlogs = () => client.get('/api/blogs');
export const getBlog = (id) => client.get(`/api/blogs/${id}`);
export const createBlog = (data) => client.post('/api/blogs', data);
export const updateBlog = (id, data) => client.put(`/api/blogs/${id}`, data);
export const deleteBlog = (id) => client.delete(`/api/blogs/${id}`);
