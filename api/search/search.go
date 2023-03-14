package search

import (
	"did-you-watch/database"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
)

type UserResult struct {
	MediaType     string `json:"media_type"`
	UID           string `json:"uid"`
	Username      string `json:"username"`
	DisplayName   string `json:"displayName"`
	ProfilePicURL string `json:"profilePicURL"`
}

func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/search/multi/:query", multiSearch(db))
}

func multiSearch(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Param("query")
		resp, err := http.Get("https://api.themoviedb.org/3/search/multi?api_key=" + os.Getenv("TMDB_API_KEY") + "&query=" + url.QueryEscape(query) + "&page=1")
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
		results := dataJSON["results"].([]any)

		rows, err := db.Db.Query(`Select username, uid, a.image_url, display_name FROM account 
												JOIN avatar a on a.id = account.profile_picture_url
												WHERE LOWER(username) LIKE LOWER('%' || $1 || '%') LIMIT 10`, query)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "User does not exist")
			return
		}
		for rows.Next() {
			var user UserResult
			err = rows.Scan(&user.Username, &user.UID, &user.ProfilePicURL, &user.DisplayName)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusBadRequest, "User does not exist")
				return
			}
			user.MediaType = "user"
			results = append(results, user)
		}

		dataJSON["results"] = results
		c.JSON(http.StatusOK, dataJSON)
	}
}
