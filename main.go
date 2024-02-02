package main

import (
	"context"
	"did-you-watch/account"
	"did-you-watch/api/movies"
	"did-you-watch/api/search"
	"did-you-watch/api/trending"
	"did-you-watch/api/tv"
	"did-you-watch/api/users"
	"did-you-watch/database"
	firebase "firebase.google.com/go/v4"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
	"log"
)

// CORSMiddleware Cannot use gin-gonic cors since pre-flight does not include
// Access-Control-Allow-Origins header when AuthToken header is included
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", database.GetEnvOrParam("FRONTEND_HOST", "FRONTEND_HOST"))
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", `Content-Type, Content-Length, Accept-Encoding, 
							X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, AuthToken`)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
func createServer(dbConnection *database.DB) {
	r := gin.Default()
	r.Use(CORSMiddleware())
	account.Routes(r.Group("account/v1"), dbConnection)

	v1 := r.Group("api/v1")
	movies.Routes(v1, dbConnection)
	tv.Routes(v1, dbConnection)
	users.Routes(v1, dbConnection)
	trending.Routes(v1)
	search.Routes(v1, dbConnection)
	r.GET("/health-check", func(c *gin.Context) {
		c.JSON(200, "Healthy")
	})

	_ = r.Run()

}

func main() {
	database.PerformMigrations("file://database/migrations")
	db := database.InitDBConnection()
	defer db.Close()

	opt := option.WithCredentialsJSON([]byte(database.GetEnvOrParam("FIREBASE_CREDS", "FIREBASE_CREDS")))
	app, err := firebase.NewApp(context.Background(), nil, opt)
	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatal("Unable to get firebase auth running")
	}
	// Run a background goroutine to clean up expired sessions from the database.
	dbConnection := &database.DB{Db: db, FireAuth: client}

	createServer(dbConnection)
}
