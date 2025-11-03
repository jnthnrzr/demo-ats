import axios from 'axios';
import type { Professional } from '../types.ts';

const API_BASE = import.meta.env.VITE_API_URL;

export const getProfessionals = async (source?: string) => {
  const url = source ? `${API_BASE}/professionals/?source=${source}` : `${API_BASE}/professionals/`;
  const res = await axios.get(url);
  return res.data;
};

export const createProfessional = async (data: Professional) => {
  const res = await axios.post(`${API_BASE}/professionals/`, data);
  return res.data;
};
