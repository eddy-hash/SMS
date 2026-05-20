import { useState, useEffect } from 'react';
import api from '../../../services/api';

export const useTeacherData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

export default useTeacherData;
