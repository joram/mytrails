import React from 'react';
import { Trail } from '../types';

interface TrailCardProps {
  trail: Trail;
  onViewDetails: (id: string) => void;
}

const TrailCard: React.FC<TrailCardProps> = ({ trail, onViewDetails }) => {
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatElevation = (min: number, max: number) => {
    if (min === 0 && max === 0) return 'N/A';
    return `${Math.round(min)}m - ${Math.round(max)}m`;
  };

  return (
    <div className="trail-card">
      <h3>{trail.name || 'Unnamed Trail'}</h3>
      {trail.description && <p className="description">{trail.description}</p>}
      
      <div className="trail-stats">
        <div className="stat">
          <strong>Distance:</strong> {formatDistance(trail.distance)}
        </div>
        <div className="stat">
          <strong>Elevation:</strong> {formatElevation(trail.elevation.min, trail.elevation.max)}
        </div>
        <div className="stat">
          <strong>Start:</strong> {trail.start_lat.toFixed(6)}, {trail.start_lng.toFixed(6)}
        </div>
        <div className="stat">
          <strong>Geohash:</strong> {trail.geohash}
        </div>
      </div>

      <button onClick={() => onViewDetails(trail.id)} className="view-details-btn">
        View Details
      </button>
    </div>
  );
};

export default TrailCard;







