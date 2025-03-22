import { useState, useCallback } from 'react';
import axios from 'axios';

interface UpdateResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  updateData: (updateEndpoint: string, updateParams: any) => void;
}

const useUpdateData = <T,>(): UpdateResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateData = useCallback(async (updateEndpoint: string, updateParams: any) => {
    setLoading(true);
    try {
      const response = await axios.put(updateEndpoint, updateParams);
      setData(response.data);
      setError(null); // Clear previous error if successful
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, updateData };
};

export default useUpdateData;
