package movies

import (
	"did-you-watch/account"
	"did-you-watch/database"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
)

// Routes All the routes created by the package nested in
// api/v1/*
func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/search/movie/:query", searchForMovie())
	r.GET("/movie/:id", getMovie(db))
	r.GET("/movie/history/:id", getWatchHistory(db))
	r.PUT("/movie/:id/:status", addToWatchlist(db))
	r.DELETE("/movie/:id", removeFromWatchlist(db))
}

func searchForMovie() gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Param("query")
		resp, err := http.Get("https://api.themoviedb.org/3/search/movie?api_key=" + os.Getenv("TMDB_API_KEY") + "&query=" + url.QueryEscape(query) + "&page=1")
		if err != nil {
			return
		}
		contents, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return
		}
		var dataJSON map[string]any
		err = json.Unmarshal(contents, &dataJSON)
		if err != nil {
			log.Println(err)
		}

		c.JSON(http.StatusOK, dataJSON)
	}
}

func getMovie(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		resp, err := http.Get("https://api.themoviedb.org/3/movie/" + url.QueryEscape(id) + "?api_key=" + os.Getenv("TMDB_API_KEY") + "&append_to_response=credits")
		if err != nil {
			return
		}
		contents, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return
		}
		var dataJSON map[string]any
		err = json.Unmarshal(contents, &dataJSON)
		if err != nil {
			log.Println(err)
		}
		c.JSON(http.StatusOK, dataJSON)
	}
}

func addToWatchlist(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		movieID := c.Param("id")
		status := c.Param("status")
		if status != "plan-to-watch" && status != "completed" && status != "started" && status != "dropped" && status != "rewatching" {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Invalid status")
			return
		}
		resp, err := http.Get("https://api.themoviedb.org/3/movie/" + url.QueryEscape(movieID) + "?api_key=" + os.Getenv("TMDB_API_KEY") + "&language=en-US")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to communicate with TMDB Server")
			return
		}
		if resp.StatusCode != http.StatusOK {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Could not find resource")
			return
		}
		contents, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to unmarshall data")
			return
		}
		var dataJSON map[string]any
		err = json.Unmarshal(contents, &dataJSON)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to unmarshall data")
			log.Println(err)
		}
		if resp.StatusCode != 200 {
			c.JSON(http.StatusNotFound, "Resource not found")
			return
		}

		var returnedID int
		var returnedName string
		var returnedPosterPath string
		var returnedOverview string
		var backdropPath string
		err = db.Db.QueryRow(`INSERT INTO movie (id, name, poster_path, overview) VALUES ($1, $2, $3, $4) 
										ON CONFLICT (id) DO UPDATE SET name=$2, poster_path=$3, overview=$4, backdrop_path=$5
										RETURNING id, name, COALESCE(poster_path, ''), COALESCE(overview, ''), COALESCE(backdrop_path, '')`,
			movieID, dataJSON["original_title"], dataJSON["poster_path"], dataJSON["overview"], dataJSON["backdrop_path"]).Scan(
			&returnedID, &returnedName, &returnedPosterPath, &returnedOverview, &backdropPath)
		if err != nil {
			fmt.Println(err)
			return
		}
		user := account.GetUserRecord(c)
		if user == nil {
			return
		}

		err = db.Db.QueryRow(`INSERT INTO movie_user_bridge (movie_id, user_id, status, timestamp) VALUES ($1, $2, $3, default) 
									  ON CONFLICT (movie_id, user_id, timestamp) DO UPDATE SET status=$3
									  RETURNING status`, movieID, user.UID, status).Scan(&status)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to add to watchlist")
			return
		}

		c.JSON(http.StatusOK, account.Movie{
			ID:           returnedID,
			Name:         returnedName,
			PosterPath:   returnedPosterPath,
			Status:       status,
			Overview:     returnedOverview,
			BackdropPath: backdropPath,
		})
	}
}

func removeFromWatchlist(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		user := account.GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove from watchlist")
			return
		}

		_, err := db.Db.Query("DELETE FROM movie_user_bridge WHERE user_id=$1 AND movie_id=$2", user.UID, id)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove from watchlist")
			return
		}
		c.JSON(http.StatusOK, "Success")
	}
}

type MovieLog struct {
	Timestamp string `json:"timestamp"`
	Status    string `json:"status"`
}

func getWatchHistory(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		user := account.GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove from watchlist")
			return
		}
		query, err := db.Db.Query(`SELECT timestamp, status FROM movie_user_bridge WHERE user_id=$1 AND movie_id=$2 ORDER BY timestamp DESC`, user.UID, id)
		if err != nil {
			c.AbortWithStatusJSON(500, "Could not get movie watch history")
			return
		}
		var history []MovieLog
		for query.Next() {
			var movieLog MovieLog
			err = query.Scan(&movieLog.Timestamp, &movieLog.Status)
			if err != nil {
				c.AbortWithStatusJSON(500, "Could not get movie watch history")
				return
			}

			history = append(history, movieLog)
		}

		c.JSON(200, history)
	}
}
