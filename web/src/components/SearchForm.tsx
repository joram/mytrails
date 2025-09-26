import React, { useState } from 'react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [params, setParams] = useState<SearchParams>({
    near_lat: 0,
    near_lng: 0,
    near_distance: 0,
  });

  const [useLocation, setUseLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useLocation) {
      onSearch(params);
    } else {
      onSearch({});
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setParams({
            ...params,
            near_lat: position.coords.latitude,
            near_lng: position.coords.longitude,
          });
          setUseLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="search-form">
      <h2>Search Trails</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => setUseLocation(e.target.checked)}
            />
            Search near my location
          </label>
          <button type="button" onClick={handleLocationSearch} disabled={!useLocation}>
            Get My Location
          </button>
        </div>

        {useLocation && (
          <>
            <div className="form-group">
              <label htmlFor="near_lat">Latitude:</label>
              <input
                type="number"
                id="near_lat"
                step="any"
                value={params.near_lat || ''}
                onChange={(e) => setParams({ ...params, near_lat: parseFloat(e.target.value) || 0 })}
                placeholder="Enter latitude"
              />
            </div>

            <div className="form-group">
              <label htmlFor="near_lng">Longitude:</label>
              <input
                type="number"
                id="near_lng"
                step="any"
                value={params.near_lng || ''}
                onChange={(e) => setParams({ ...params, near_lng: parseFloat(e.target.value) || 0 })}
                placeholder="Enter longitude"
              />
            </div>

            <div className="form-group">
              <label htmlFor="near_distance">Search Radius (meters):</label>
              <input
                type="number"
                id="near_distance"
                value={params.near_distance || ''}
                onChange={(e) => setParams({ ...params, near_distance: parseFloat(e.target.value) || 0 })}
                placeholder="Enter search radius in meters"
              />
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Trails'}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;







