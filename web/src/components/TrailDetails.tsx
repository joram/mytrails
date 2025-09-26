import React from 'react';
import { Trail } from '../types';

interface TrailDetailsProps {
  trail: Trail;
  onClose: () => void;
}

const TrailDetails: React.FC<TrailDetailsProps> = ({ trail, onClose }) => {
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
    <div className="trail-details-overlay">
      <div className="trail-details">
        <div className="trail-details-header">
          <h2>{trail.name || 'Unnamed Trail'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {trail.description && (
          <div className="trail-section">
            <h3>Description</h3>
            <p>{trail.description}</p>
          </div>
        )}

        <div className="trail-section">
          <h3>Trail Information</h3>
          <div className="trail-info-grid">
            <div className="info-item">
              <strong>Distance:</strong> {formatDistance(trail.distance)}
            </div>
            <div className="info-item">
              <strong>Elevation Range:</strong> {formatElevation(trail.elevation.min, trail.elevation.max)}
            </div>
            <div className="info-item">
              <strong>Start Coordinates:</strong> {trail.start_lat.toFixed(6)}, {trail.start_lng.toFixed(6)}
            </div>
            <div className="info-item">
              <strong>Geohash:</strong> {trail.geohash}
            </div>
            <div className="info-item">
              <strong>Total Points:</strong> {trail.points?.length || 0}
            </div>
          </div>
        </div>

        {trail.points && trail.points.length > 0 && (
          <div className="trail-section">
            <h3>Trail Points</h3>
            <div className="points-info">
              <p>This trail contains {trail.points.length} GPS points.</p>
              <p>First point: {trail.points[0].Latitude.toFixed(6)}, {trail.points[0].Longitude.toFixed(6)}</p>
              {trail.points.length > 1 && (
                <p>Last point: {trail.points[trail.points.length - 1].Latitude.toFixed(6)}, {trail.points[trail.points.length - 1].Longitude.toFixed(6)}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailDetails;







