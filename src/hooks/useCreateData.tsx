import { useState, useCallback } from 'react';
import axios from 'axios';

interface UpdateResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  createData: (createEndpoint: string, createParams: any) => void;
}

const useCreateData = <T,>(): UpdateResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createData = useCallback(async (createEndpoint: string, createParams: any) => {
    setLoading(true);
    try {
      const response = await axios.post(createEndpoint, createParams);
      setData(response.data);
      setError(null); // Clear previous error if successful
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, createData };
};

export default useCreateData;
