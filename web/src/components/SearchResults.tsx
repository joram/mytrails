import React from 'react';
import { Trail } from '../types';
import './SearchResults.css';

interface SearchResultsProps {
  trails: Trail[];
  onViewDetails: (id: string) => void;
  onBack: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ trails, onViewDetails, onBack }) => {
  const formatDistance = (distance: number | null) => {
    if (distance === null || distance === undefined) return 'N/A';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };


  const formatElevationRange = (elevation: { min: number; max: number } | null) => {
    if (!elevation) return 'N/A';
    return `${Math.round(elevation.min)}m - ${Math.round(elevation.max)}m`;
  };


  return (
    <div className="search-results">
      <div className="search-results-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Search
        </button>
        <h2>Search Results ({trails.length} trails found)</h2>
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Trail Name</th>
              <th>Distance</th>
              <th>Elevation</th>
              <th>Start Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trails.map((trail) => (
              <tr key={trail.id}>
                <td className="trail-name">
                  <div className="name-cell">
                    <strong>{trail.name || 'Unnamed Trail'}</strong>
                    {trail.description && (
                      <div className="trail-description">{trail.description}</div>
                    )}
                  </div>
                </td>
                <td className="distance">
                  <div className="distance-cell">
                    <div className="primary-distance">{formatDistance(trail.distance)}</div>
                    {trail.distance !== null && (
                      <div className="distance-label">from search point</div>
                    )}
                  </div>
                </td>
                <td className="elevation">
                  <div className="elevation-cell">
                    {formatElevationRange(trail.elevation)}
                  </div>
                </td>
                <td className="location">
                  <div className="location-cell">
                    <div className="coordinates">
                      {trail.start_lat.toFixed(4)}, {trail.start_lng.toFixed(4)}
                    </div>
                    <div className="geohash">{trail.geohash}</div>
                  </div>
                </td>
                <td className="actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => onViewDetails(trail.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trails.length === 0 && (
        <div className="no-results">
          <p>No trails found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
