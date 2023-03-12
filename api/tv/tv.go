package tv

import (
	"database/sql"
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
	r.GET("/search/tv/:query", searchForTV(db))
	r.GET("/tv/:id", getTVShow(db))
	r.PUT("/tv/:id/:status", addToWatchlist(db))
	r.DELETE("/tv/:id", removeFromWatchlist(db))
}

func searchForTV(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Param("query")
		resp, err := http.Get("https://api.themoviedb.org/3/search/tv?api_key=" + os.Getenv("TMDB_API_KEY") + "&query=" + url.QueryEscape(query) + "&page=1")
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

func getTVShow(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		resp, err := http.Get("https://api.themoviedb.org/3/tv/" + url.QueryEscape(id) + "?api_key=" + os.Getenv("TMDB_API_KEY") + "&append_to_response=aggregate_credits")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Could not retrieve show.")
			return
		}
		contents, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Could not retrieve show.")
			return
		}
		var dataJSON map[string]any
		err = json.Unmarshal(contents, &dataJSON)
		if err != nil {
			log.Println(err)
		}
		if resp.StatusCode == 200 {
			err = db.Db.QueryRow(`UPDATE tv SET total_episodes=$1 WHERE id=$2`, dataJSON["number_of_episodes"], id).Scan()
			if err != nil && err != sql.ErrNoRows {
				fmt.Println("EPISODE UPDATE ERROR", err)
				return
			}
		}
		c.JSON(http.StatusOK, dataJSON)
	}
}

func addToWatchlist(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tvID := c.Param("id")
		status := c.Param("status")
		if status != "plan-to-watch" && status != "completed" && status != "started" && status != "dropped" && status != "rewatching" {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Invalid status")
			return
		}

		resp, err := http.Get("https://api.themoviedb.org/3/tv/" + url.QueryEscape(tvID) + "?api_key=" + os.Getenv("TMDB_API_KEY") + "&language=en-US")
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
			return
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
		var totalEpisodes int
		err = db.Db.QueryRow(`INSERT INTO tv (id, name, poster_path, overview, backdrop_path, total_episodes) VALUES ($1, $2, $3, $4, $5, $6) 
										ON CONFLICT (id) DO UPDATE SET name=$2, poster_path=$3, overview=$4, backdrop_path=$5, total_episodes=$6
										returning id, name, COALESCE(poster_path, ''), COALESCE(overview, ''), COALESCE(backdrop_path, ''), total_episodes`,
			tvID, dataJSON["original_name"], dataJSON["poster_path"], dataJSON["overview"], dataJSON["backdrop_path"], dataJSON["number_of_episodes"]).Scan(
			&returnedID, &returnedName, &returnedPosterPath, &returnedOverview, &backdropPath, &totalEpisodes)
		if err != nil {
			fmt.Println(err)
			return
		}
		user := account.GetUserRecord(c)
		if user == nil {
			return
		}

		var episodesWatched int
		err = db.Db.QueryRow(`INSERT INTO tv_user_bridge (tv_id, user_id, status, episodes_watched) VALUES ($1, $2, $3, $4) 
										ON CONFLICT (tv_id, user_id) DO UPDATE SET status=$3, episodes_watched=$4
										returning status, episodes_watched`, tvID, user.UID, status, 0).Scan(&status, &episodesWatched)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to add to watchlist")
			return
		}

		c.JSON(http.StatusOK, account.TV{
			ID:              returnedID,
			Name:            returnedName,
			PosterPath:      returnedPosterPath,
			Status:          status,
			Overview:        returnedOverview,
			BackdropPath:    backdropPath,
			TotalEpisodes:   totalEpisodes,
			EpisodesWatched: episodesWatched,
		})
	}
}

func removeFromWatchlist(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		user := account.GetUserRecord(c)
		if user == nil {
			return
		}

		_, err := db.Db.Query("DELETE FROM tv_user_bridge WHERE user_id=$1 AND tv_id=$2", user.UID, id)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove from watchlist")
			return
		}
		c.JSON(http.StatusOK, "Success")
	}
}
