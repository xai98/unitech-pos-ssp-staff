import axios from 'axios';
import { consts } from '../utils';

const API_URL = consts.BACKEND_ENPOINT;

interface LoginData {
  username: string;
  password: string;
}

export const login = async (data: LoginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
