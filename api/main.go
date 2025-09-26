package main

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mmcloughlin/geohash"
	"github.com/tkrajina/gpxgo/gpx"
)

// Trail represents a trail with its metadata and geohash
type Trail struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	StartLat    float64 `json:"start_lat"`
	StartLng    float64 `json:"start_lng"`
	Geohash     string  `json:"geohash"`
	Distance    float64 `json:"distance"`
	Elevation   struct {
		Min float64 `json:"min"`
		Max float64 `json:"max"`
	} `json:"elevation"`
	Points []gpx.GPXPoint `json:"points"`
}

// SearchRequest represents the search parameters
type SearchRequest struct {
	NearLat      float64 `form:"near_lat"`
	NearLng      float64 `form:"near_lng"`
	NearDistance float64 `form:"near_distance"`
}

var (
	trails       []Trail
	loading      bool = true
	loadComplete bool = false
)

func main() {
	// Setup Gin router
	r := gin.Default()

	// Enable CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API routes
	r.GET("/search", searchTrails)
	r.GET("/route/:id", getTrailByID)
	r.GET("/trails", getAllTrails)
	r.GET("/status", getStatus)

	// Start GPX loading in background
	go loadGPXFiles()

	// Start server immediately
	fmt.Println("Starting server on :8080")
	fmt.Println("Loading GPX files in background...")
	log.Fatal(r.Run(":8080"))
}

func loadGPXFiles() {
	// Look for GPX files in the gpx directory
	gpxDir := "./gpx"
	if _, err := os.Stat(gpxDir); os.IsNotExist(err) {
		log.Printf("GPX directory not found: %s", gpxDir)
		loading = false
		loadComplete = true
		return
	}

	err := filepath.Walk(gpxDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(strings.ToLower(path), ".gpx") {
			fmt.Printf("Loading GPX file: %s\n", path)
			loadGPXFile(path)
		}

		return nil
	})

	if err != nil {
		log.Printf("Error walking directory: %v", err)
	}

	loading = false
	loadComplete = true
	fmt.Printf("Loaded %d trails\n", len(trails))
}

func loadGPXFile(filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening file %s: %v", filePath, err)
		return
	}
	defer file.Close()

	gpxData, err := gpx.Parse(file)
	if err != nil {
		log.Printf("Error parsing GPX file %s: %v", filePath, err)
		return
	}

	// Extract metadata from GPX
	trail := Trail{
		ID:          generateID(filePath),
		Name:        gpxData.Name,
		Description: gpxData.Description,
	}

	// Get start point (first track point)
	if len(gpxData.Tracks) > 0 && len(gpxData.Tracks[0].Segments) > 0 && len(gpxData.Tracks[0].Segments[0].Points) > 0 {
		startPoint := gpxData.Tracks[0].Segments[0].Points[0]
		trail.StartLat = startPoint.Latitude
		trail.StartLng = startPoint.Longitude
		trail.Geohash = geohash.Encode(startPoint.Latitude, startPoint.Longitude)
	}

	// Calculate distance and elevation
	trail.Distance = calculateDistance(gpxData)
	trail.Elevation.Min, trail.Elevation.Max = calculateElevation(gpxData)

	// Store all points
	trail.Points = extractAllPoints(gpxData)

	trails = append(trails, trail)
}

func generateID(filePath string) string {
	// Use filename as ID, removing extension and path
	base := filepath.Base(filePath)
	return strings.TrimSuffix(base, filepath.Ext(base))
}

func calculateDistance(gpxData *gpx.GPX) float64 {
	totalDistance := 0.0

	for _, track := range gpxData.Tracks {
		for _, segment := range track.Segments {
			for i := 1; i < len(segment.Points); i++ {
				prev := segment.Points[i-1]
				curr := segment.Points[i]
				totalDistance += haversineDistance(prev.Latitude, prev.Longitude, curr.Latitude, curr.Longitude)
			}
		}
	}

	return totalDistance
}

func calculateElevation(gpxData *gpx.GPX) (min, max float64) {
	min = math.MaxFloat64
	max = -math.MaxFloat64

	for _, track := range gpxData.Tracks {
		for _, segment := range track.Segments {
			for _, point := range segment.Points {
				if point.Elevation.NotNull() {
					elevation := point.Elevation.Value()
					if elevation < min {
						min = elevation
					}
					if elevation > max {
						max = elevation
					}
				}
			}
		}
	}

	if min == math.MaxFloat64 {
		min = 0
	}
	if max == -math.MaxFloat64 {
		max = 0
	}

	return min, max
}

func extractAllPoints(gpxData *gpx.GPX) []gpx.GPXPoint {
	var points []gpx.GPXPoint

	for _, track := range gpxData.Tracks {
		for _, segment := range track.Segments {
			points = append(points, segment.Points...)
		}
	}

	return points
}

func haversineDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371000 // Earth's radius in meters

	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLng/2)*math.Sin(dLng/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

func searchTrails(c *gin.Context) {
	if loading {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "Trails are still loading. Please try again in a moment.",
			"loading": true,
		})
		return
	}

	var searchReq SearchRequest

	if err := c.ShouldBindQuery(&searchReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var results []Trail

	if searchReq.NearLat != 0 && searchReq.NearLng != 0 {
		// Filter by location
		for _, trail := range trails {
			distance := haversineDistance(searchReq.NearLat, searchReq.NearLng, trail.StartLat, trail.StartLng)

			if searchReq.NearDistance == 0 || distance <= searchReq.NearDistance {
				// Create a copy without all points for search results
				trailCopy := trail
				trailCopy.Points = nil        // Don't include all points in search results
				trailCopy.Distance = distance // Override with distance to search point
				results = append(results, trailCopy)
			}
		}
	} else {
		// Return all trails without points
		for _, trail := range trails {
			trailCopy := trail
			trailCopy.Points = nil
			results = append(results, trailCopy)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"trails": results,
		"count":  len(results),
	})
}

func getTrailByID(c *gin.Context) {
	if loading {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "Trails are still loading. Please try again in a moment.",
			"loading": true,
		})
		return
	}

	id := c.Param("id")

	for _, trail := range trails {
		if trail.ID == id {
			c.JSON(http.StatusOK, trail)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Trail not found"})
}

func getAllTrails(c *gin.Context) {
	if loading {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "Trails are still loading. Please try again in a moment.",
			"loading": true,
		})
		return
	}

	// Return all trails without points
	var results []Trail
	for _, trail := range trails {
		trailCopy := trail
		trailCopy.Points = nil
		results = append(results, trailCopy)
	}

	c.JSON(http.StatusOK, gin.H{
		"trails": results,
		"count":  len(results),
	})
}

func getStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"loading":       loading,
		"load_complete": loadComplete,
		"trails_loaded": len(trails),
		"status": func() string {
			if loading {
				return "loading"
			}
			if loadComplete {
				return "ready"
			}
			return "unknown"
		}(),
	})
}
