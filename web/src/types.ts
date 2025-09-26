export interface Trail {
  id: string;
  name: string;
  description: string;
  start_lat: number;
  start_lng: number;
  geohash: string;
  distance: number;
  elevation: {
    min: number;
    max: number;
  };
  points?: any[];
}

export interface SearchParams {
  near_lat?: number;
  near_lng?: number;
  near_distance?: number;
}

export interface SearchResponse {
  trails: Trail[];
  count: number;
}







