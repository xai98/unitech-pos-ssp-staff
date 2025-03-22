import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface FetchDataResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void; // เพิ่มบรรทัดนี้
}

const useFetchDataQrcode = <T,>(endpoint: string, params?: Record<string, any>): FetchDataResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axios.get(endpoint, { params });
      setData(result.data);
      setError(null); // Clear previous error if successful
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    getData();
  }, [getData]);

  return { data, loading, error, refresh: getData };
};

export default useFetchDataQrcode;
