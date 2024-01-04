package trending

import (
	"did-you-watch/database"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
)

// Routes All the routes created by the package nested in
// api/v1/*
func Routes(r *gin.RouterGroup) {
	r.GET("/trending", getTrending())
}

func getTrending() gin.HandlerFunc {
	return func(c *gin.Context) {
		resp, err := http.Get("https://api.themoviedb.org/3/trending/all/week?api_key=" + database.GetEnvOrParam("TMDB_API_KEY", "TMDB_API_KEY"))
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
