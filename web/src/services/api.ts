import axios from 'axios';
import { Trail, SearchParams, SearchResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trailService = {
  // Get API status
  getStatus: async (): Promise<any> => {
    const response = await api.get('/status');
    return response.data;
  },

  // Search trails with optional location parameters
  searchTrails: async (params: SearchParams = {}): Promise<SearchResponse> => {
    const response = await api.get('/search', { params });
    return response.data as SearchResponse;
  },

  // Get all trails
  getAllTrails: async (): Promise<SearchResponse> => {
    const response = await api.get('/trails');
    return response.data as SearchResponse;
  },

  // Get trail by ID with full details
  getTrailById: async (id: string): Promise<Trail> => {
    const response = await api.get(`/route/${id}`);
    return response.data as Trail;
  },
};

export default api;
