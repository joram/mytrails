# MyTrails - GPX Trail Explorer

A full-stack application for exploring and searching GPX trail files with geohashing and location-based search capabilities.

## Features

- **GPX File Processing**: Automatically parses GPX files and extracts metadata
- **Geohashing**: Generates geohashes for trail start points for efficient location-based queries
- **Location Search**: Search for trails near specific coordinates with radius filtering
- **Trail Details**: View comprehensive trail information including elevation, distance, and GPS points
- **Modern Web Interface**: React TypeScript frontend with responsive design

## Architecture

- **API Service**: Golang REST API with GPX parsing and geohashing
- **Web Service**: React TypeScript frontend with modern UI
- **Docker**: Containerized services with docker-compose orchestration

## Quick Start

### Prerequisites

- Docker and Docker Compose
- GPX files to process (place them in a `gpx/` directory)

### Running the Application

1. **Clone and setup**:
   ```bash
   git clone https://github.com/joram/trails.git
   cd trails
   ```

2. **Add GPX files**:
   ```bash
   mkdir gpx
   # Copy your .gpx files into the gpx/ directory
   ```

3. **Start the services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Web Interface: http://localhost:3000
   - API: http://localhost:8080

## API Endpoints

### Search Trails
```
GET /search?near_lat=40.7128&near_lng=-74.0060&near_distance=1000
```
- `near_lat`: Latitude for location-based search
- `near_lng`: Longitude for location-based search  
- `near_distance`: Search radius in meters (optional)

### Get All Trails
```
GET /trails
```

### Get Trail Details
```
GET /route/{id}
```

## Development

### API Development
```bash
cd api
go mod tidy
go run main.go
```

### Web Development
```bash
cd web
npm install
npm start
```

## Project Structure

```
mytrails/
├── api/                    # Golang API service
│   ├── main.go            # Main API application
│   ├── go.mod             # Go dependencies
│   └── Dockerfile         # API container
├── web/                   # React TypeScript frontend
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── types.ts       # TypeScript types
│   ├── Dockerfile         # Web container
│   └── nginx.conf         # Nginx configuration
├── gpx/                   # GPX files directory
├── docker-compose.yml     # Service orchestration
└── README.md             # This file
```

## Features in Detail

### GPX Processing
- Extracts trail name, description, and metadata
- Calculates total distance using Haversine formula
- Determines elevation min/max values
- Generates geohashes for efficient spatial queries

### Location Search
- Find trails within a specified radius of coordinates
- Uses geohashing for efficient spatial indexing
- Returns distance from search point to trail start

### Trail Information
- Complete trail metadata
- GPS point data for mapping
- Elevation profiles
- Distance calculations

## Configuration

### Environment Variables
- `REACT_APP_API_URL`: API base URL for frontend (default: http://localhost:8080)
- `GIN_MODE`: Gin framework mode (default: release in production)

### Docker Volumes
- `./gpx:/app/gpx:ro`: Mount GPX files directory (read-only)

## Troubleshooting

### API Not Loading GPX Files
- Ensure GPX files are in the `gpx/` directory
- Check file permissions and format
- Verify API logs for parsing errors

### Web Interface Not Connecting to API
- Check that API service is running on port 8080
- Verify CORS settings in API
- Check browser console for network errors

### Performance Issues
- Large GPX files may impact loading time
- Consider limiting the number of GPS points returned in search results
- Monitor memory usage with many trails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with docker-compose
5. Submit a pull request

## License

MIT License - see LICENSE file for details
