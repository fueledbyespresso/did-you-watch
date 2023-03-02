package main

import (
	"did-you-watch/account"
	"did-you-watch/api/movies"
	"did-you-watch/api/tv"
	"did-you-watch/database"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"time"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, AuthToken")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
func createServer(dbConnection *database.DB) *gin.Engine {
	r := gin.Default()
	r.Use(CORSMiddleware())
	account.Routes(r.Group("account/v1"), dbConnection)

	v1 := r.Group("api/v1")
	movies.Routes(v1, dbConnection)
	tv.Routes(v1, dbConnection)

	r.Use(static.Serve("/", static.LocalFile("./frontend/build", true)))

	return r
}

func main() {
	database.PerformMigrations("file://database/migrations")
	db := database.InitDBConnection()
	defer db.Close()

	SStore := database.InitOauthStore()
	// Run a background goroutine to clean up expired sessions from the database.
	defer SStore.StopCleanup(SStore.Cleanup(time.Minute * 5))
	dbConnection := &database.DB{Db: db, SessionStore: SStore}

	r := createServer(dbConnection)

	_ = r.Run()
}
