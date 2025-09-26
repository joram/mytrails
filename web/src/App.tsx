import React, { useState, useEffect } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import TrailDetails from './components/TrailDetails';
import { trailService } from './services/api';
import { Trail, SearchParams } from './types';

function App() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'results' | 'details'>('search');

  // Check API status and load trails when ready
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await trailService.getStatus();
      setApiStatus(status);
      setApiLoading(status.loading);
      
      if (!status.loading && status.load_complete) {
        loadAllTrails();
      } else if (!status.loading && !status.load_complete) {
        // API is ready but no trails loaded, try to load anyway
        loadAllTrails();
      } else {
        // Still loading, check again in 2 seconds
        setTimeout(checkApiStatus, 2000);
      }
    } catch (err) {
      console.error('Error checking API status:', err);
      setError('Failed to connect to API. Please check if the API is running.');
    }
  };

  const loadAllTrails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trailService.getAllTrails();
      setTrails(response.trails || []);
    } catch (err) {
      setError('Failed to load trails. Please check if the API is running.');
      console.error('Error loading trails:', err);
      setTrails([]); // Ensure trails is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await trailService.searchTrails(params);
      setTrails(response.trails || []);
      setCurrentView('results'); // Show results page
    } catch (err) {
      setError('Failed to search trails. Please check if the API is running.');
      console.error('Error searching trails:', err);
      setTrails([]); // Ensure trails is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      setLoading(true);
      const trail = await trailService.getTrailById(id);
      setSelectedTrail(trail);
      setCurrentView('details');
    } catch (err) {
      setError('Failed to load trail details.');
      console.error('Error loading trail details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedTrail(null);
    setCurrentView('results');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setTrails([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MyTrails - GPX Trail Explorer</h1>
        <p>Explore and search through your GPX trail collection</p>
      </header>

      <main className="App-main">
        {apiLoading && (
          <div className="loading">
            <h3>🚀 API Starting Up...</h3>
            <p>Loading GPX files in the background. This may take a moment.</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${apiStatus?.progress_percent || 0}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {apiStatus?.loaded_gpx_files || 0} / {apiStatus?.total_gpx_files || 0} files loaded
                ({Math.round(apiStatus?.progress_percent || 0)}%)
              </div>
            </div>
            <div className="loading-spinner">⏳</div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={checkApiStatus}>Retry</button>
          </div>
        )}

        {loading && !apiLoading && <div className="loading">Loading trails...</div>}

        {!apiLoading && currentView === 'search' && (
          <SearchForm onSearch={handleSearch} loading={loading} />
        )}

        {!apiLoading && currentView === 'results' && (
          <SearchResults 
            trails={trails}
            onViewDetails={handleViewDetails}
            onBack={handleBackToSearch}
          />
        )}

        {!apiLoading && currentView === 'details' && selectedTrail && (
          <TrailDetails
            trail={selectedTrail}
            onClose={handleCloseDetails}
          />
        )}
      </main>
    </div>
  );
}

export default App;