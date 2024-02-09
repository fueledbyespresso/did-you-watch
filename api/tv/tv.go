package tv

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
)

// Routes All the routes created by the package nested in
// api/v1/*
func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/search/tv/:query", searchForTV(db))
	r.GET("/tv/:id/season/:season", getAllEpisodes(db))
	r.PUT("/tv/:id/:status", addToWatchlist(db))
	r.PUT("/tv/:id/season/:season/episode/:episode", markWatched(db))
	r.DELETE("/tv/:id", removeFromWatchlist(db))
	r.DELETE("/tv/:id/season/:season/episode/:episode", markUnwatched(db))
}

func searchForTV(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Param("query")
		resp, err := http.Get("https://api.themoviedb.org/3/search/tv?api_key=" + database.GetEnvOrParam("TMDB_API_KEY", "TMDB_API_KEY") + "&query=" + url.QueryEscape(query) + "&page=1")
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
		tvID := c.Param("id")
		status := c.Param("status")

		if status != "plan-to-watch" && status != "completed" && status != "started" && status != "dropped" && status != "rewatching" {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Invalid status")
			return
		}

		resp, err := http.Get("https://api.themoviedb.org/3/tv/" + url.QueryEscape(tvID) + "?api_key=" + database.GetEnvOrParam("TMDB_API_KEY", "TMDB_API_KEY") + "&language=en-US")
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
		err = db.Db.QueryRow(`INSERT INTO tv (id, name, poster_path, overview, backdrop_path) VALUES ($1, $2, $3, $4, $5) 
										ON CONFLICT (id) DO UPDATE SET name=$2, poster_path=$3, overview=$4, backdrop_path=$5
										returning id, name, COALESCE(poster_path, ''), COALESCE(overview, ''), COALESCE(backdrop_path, '')`,
			tvID, dataJSON["original_name"], dataJSON["poster_path"], dataJSON["overview"], dataJSON["backdrop_path"]).Scan(
			&returnedID, &returnedName, &returnedPosterPath, &returnedOverview, &backdropPath)
		if err != nil {
			fmt.Println(err)
			return
		}
		UID := account.GetUID(c, db)
		if UID == "" {
			return
		}

		err = db.Db.QueryRow(`INSERT INTO tv_user_bridge (tv_id, user_id, status) VALUES ($1, $2, $3) 
										ON CONFLICT (tv_id, user_id, timestamp) DO UPDATE SET status=$3
										returning status`, tvID, UID, status).Scan(&status)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to add to watchlist")
			return
		}

		c.JSON(http.StatusOK, account.TV{
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
		UID := account.GetUID(c, db)
		if UID == "" {
			return
		}

		err := db.Db.QueryRow("DELETE FROM tv_user_bridge WHERE user_id=$1 AND tv_id=$2", UID, id).Scan()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove show from watchlist")
			return
		}
		err = db.Db.QueryRow("DELETE FROM episode_user_bridge WHERE user_id=$1 AND tv_id=$2", UID, id).Scan()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove episodes for show from watchlist")
			return
		}
		c.JSON(http.StatusOK, "Success")
	}
}

func markUnwatched(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		seasonNum := c.Param("season")
		episodeNum := c.Param("episode")
		tvID := c.Param("id")

		UID := account.GetUID(c, db)
		if UID == "" {
			return
		}

		rows, err := db.Db.Query("DELETE FROM episode_user_bridge WHERE user_id=$1 AND episode_number=$2 AND season_number=$3 AND tv_id=$4", UID, episodeNum, seasonNum, tvID)
		defer rows.Close()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to remove from watchlist")
			return
		}
		c.JSON(http.StatusOK, "Success")
	}
}

func markWatched(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		seasonNum := c.Param("season")
		episodeNum := c.Param("episode")
		tvID := c.Param("id")

		UID := account.GetUID(c, db)
		if UID == "" {
			c.AbortWithStatusJSON(400, "Invalid user")
			return
		}
		showData, err := getTMDBEndpointAsJSON("https://api.themoviedb.org/3/tv/" + url.QueryEscape(tvID) +
			"?api_key=" + database.GetEnvOrParam("TMDB_API_KEY", "TMDB_API_KEY") +
			"&append_to_response=season/" + seasonNum + "/episode/" + episodeNum + "&language=en-US")
		if err != nil {
			c.AbortWithStatusJSON(500, err.Error())
			return
		}
		if _, ok := showData["season/"+seasonNum+"/episode/"+episodeNum]; !ok {
			c.AbortWithStatusJSON(http.StatusNotFound, "episode not found")
			return
		}

		_ = db.Db.QueryRow(`INSERT INTO tv (id, name, poster_path, overview, backdrop_path) VALUES ($1,$2,$3,$4,$5) 
										ON CONFLICT (id) DO UPDATE SET name=$2, poster_path=$3, overview=$4, backdrop_path=$5`,
			showData["id"], showData["name"], showData["poster_path"], showData["overview"], showData["backdrop_path"]).Scan()
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, "Unable to add show to cache")
			return
		}
		var episodeData = showData["season/"+seasonNum+"/episode/"+episodeNum].(map[string]any)

		_ = db.Db.QueryRow("INSERT INTO episode (title, season_number, episode_number, tv_id)  VALUES ($1,$2,$3, $4) ON CONFLICT (season_number, episode_number, tv_id) DO UPDATE SET title=$1", episodeData["name"], seasonNum, episodeNum, tvID).Scan()
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to mark as watched")
			return
		}
		_ = db.Db.QueryRow("INSERT INTO episode_user_bridge (season_number, episode_number, tv_id, user_id) VALUES ($1, $2, $3, $4) on conflict do nothing ", seasonNum, episodeNum, tvID, UID).Scan()
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(http.StatusBadRequest, "Unable to mark as watched")
			return
		}

		c.JSON(http.StatusOK, "Success")
	}
}

func getTMDBEndpointAsJSON(endpoint string) (map[string]any, error) {
	resp, err := http.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("unable to communicate with TMDB Server")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("could not find resource")
	}
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("unable to unmarshall data")
	}
	var dataJSON map[string]any
	err = json.Unmarshal(contents, &dataJSON)
	if err != nil {
		return nil, fmt.Errorf("unable to unmarshall data")
	}

	return dataJSON, nil
}

func getAllEpisodes(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		seasonNum := c.Param("season")
		tvID := c.Param("id")
		UID := account.GetUID(c, db)
		if UID == "" {
			return
		}
		query, err := db.Db.Query(`SELECT episode_number from episode_user_bridge WHERE user_id=$1 AND tv_id=$2 AND season_number=$3`, UID, tvID, seasonNum)
		if err != nil {
			c.AbortWithStatusJSON(400, "Invalid user")
			return
		}
		episodeNumbers := []int{}
		for query.Next() {
			var episode int
			err = query.Scan(&episode)
			if err != nil {
				c.AbortWithStatusJSON(500, "Could not connect to database")
				return
			}
			episodeNumbers = append(episodeNumbers, episode)
		}
		_ = query.Close()

		fmt.Println(episodeNumbers)
		c.JSON(http.StatusOK, episodeNumbers)
	}
}
