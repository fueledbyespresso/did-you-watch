package users

import (
	"did-you-watch/account"
	"did-you-watch/database"
	"github.com/gin-gonic/gin"
	"net/http"
)

func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/user/:uid", handleGetUserByUID(db))
}

func handleGetUserByUID(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("uid")

		User, err := account.GetUser(uid, db)
		if err != nil {
			c.AbortWithStatusJSON(500, "Unable to get user")
			return
		}
		if User.Username == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, "User does not exist")
		}

		c.JSON(http.StatusOK, User)
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
