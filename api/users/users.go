package users

import (
	"did-you-watch/account"
	"did-you-watch/database"
	"github.com/gin-gonic/gin"
	"net/http"
)

func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/user/:uid", handleGetUserByUID(db))
	r.GET("/search/users/:username", handleSearchForUser(db))
}

func handleGetUserByUID(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("uid")

		username, displayName, profilePicURL, movieList, tvList, darkMode := account.GetUser(uid, db)
		if username == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, "User does not exist")
		}

		c.JSON(http.StatusOK, account.User{
			UID:           uid,
			Username:      username,
			DisplayName:   displayName,
			ProfilePicURL: profilePicURL,
			DarkMode:      darkMode,
			MovieList:     movieList,
			TVList:        tvList,
		})
	}
}

func handleSearchForUser(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		rows, err := db.Db.Query(`Select username, uid, a.image_url, display_name FROM account 
												JOIN avatar a on a.id = account.profile_picture_url
												WHERE LOWER(username) LIKE LOWER('%' || $1 || '%')`, username)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, "User does not exist")
			return
		}
		var users []account.User
		for rows.Next() {
			var user account.User
			err = rows.Scan(&user.Username, &user.UID, &user.ProfilePicURL, &user.DisplayName)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusBadRequest, "User does not exist")
				return
			}

			users = append(users, user)
		}
		c.JSON(http.StatusOK, users)
	}
}
