import { useState } from 'react';
import axios from 'axios';

const useDeleteData = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteData = async (endpoint: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, deleteData };
};

export default useDeleteData;
