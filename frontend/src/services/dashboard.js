import api from './api';

export const getCounts = async () => {
  const res = await api.get('/dashboard/counts');
  return res.data;
};