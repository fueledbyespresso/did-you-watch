package actors

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
)

func Routes(r *gin.RouterGroup) {
	r.GET("/actor/:id", getActor())
}
func getActor() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		resp, err := http.Get("https://api.themoviedb.org/3/person/" + url.QueryEscape(id) + "?api_key=" + os.Getenv("TMDB_API_KEY") + "&append_to_response=combined_credits")
		fmt.Println("https://api.themoviedb.org/3/person/" + url.QueryEscape(id) + "?api_key=" + "HIDDEN_KEY" + "&append_to_response=combined_credits")
		if err != nil {
			return
		}
		contents, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return
		}
		var extraLenient interface{}
		err = json.Unmarshal(contents, &extraLenient)

		if err != nil {
			fmt.Println(err)
		}
		fmt.Println(extraLenient)

		var dataJSON map[string]any
		err = json.Unmarshal(contents, &dataJSON)
		if err != nil {
			fmt.Println(err)
		}
		for s := range dataJSON {
			fmt.Println(s)
		}

		c.JSON(http.StatusOK, dataJSON)
	}
}
