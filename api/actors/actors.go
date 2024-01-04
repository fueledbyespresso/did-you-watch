package actors

import (
	"did-you-watch/database"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
	"net/url"
)

func Routes(r *gin.RouterGroup) {
	r.GET("/actor/:id", getActor())
}
func getActor() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		resp, err := http.Get("https://api.themoviedb.org/3/person/" + url.QueryEscape(id) + "?append_to_response=combined_credits&api_key=" + database.GetEnvOrParam("TMDB_API_KEY", "TMDB_API_KEY"))
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
			fmt.Println(err)
		}

		c.JSON(http.StatusOK, dataJSON)
	}
}
