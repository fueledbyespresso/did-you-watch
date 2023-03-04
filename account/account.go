package account

import (
	"did-you-watch/database"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"fmt"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
	"os"
)

type Error struct {
	StatusCode   int    `json:"status_code"`
	ErrorMessage string `json:"error_msg"`
}

type User struct {
	UID           string  `json:"uid"`
	Username      string  `json:"username"`
	DisplayName   string  `json:"displayName"`
	ProfilePicURL string  `json:"profilePicURL"`
	MovieList     []Movie `json:"movieList"`
	TVList        []TV    `json:"tvList"`
}

type Movie struct {
	ID         int    `json:"id"`
	Name       string `json:"original_title"`
	PosterPath string `json:"poster_path"`
	Status     string `json:"status"`
	Overview   string `json:"overview"`
}

type TV struct {
	ID         int    `json:"id"`
	Name       string `json:"original_name"`
	PosterPath string `json:"poster_path"`
	Status     string `json:"status"`
	Overview   string `json:"overview"`
}

// Routes All the routes created by the package nested in
// oauth/v1/*
func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/login", handleLogin(db))
	r.PUT("/username", handleChangeUsername(db))
	r.PUT("/displayName", handleChangeDisplayName(db))
}

func GetUserRecord(c *gin.Context) *auth.UserRecord {
	idToken := c.GetHeader("AuthToken")
	if idToken == "" {
		c.AbortWithStatusJSON(400, "Missing AuthToken header")

		return nil
	}
	opt := option.WithCredentialsJSON([]byte(os.Getenv("FIREBASE_CREDS")))

	app, err := firebase.NewApp(c, nil, opt)

	client, err := app.Auth(c)
	if err != nil {
		c.AbortWithStatusJSON(500, "Error getting Auth Client")
		return nil
	}

	token, err := client.VerifyIDTokenAndCheckRevoked(c, idToken)
	if err != nil {
		fmt.Println(err)
		c.AbortWithStatusJSON(500, "Error verifying token")

		return nil
	}

	user, err := client.GetUser(c, token.UID)
	if err != nil {
		fmt.Println(err)
		c.AbortWithStatusJSON(500, "Error getting user")

		return nil
	}
	return user
}

func handleLogin(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}
		username, displayName, profilePicURL, movieList, tvList := GetUser(user.UID, db)
		if username == "" {
			err := createUser(user.UID, user.Email, user.DisplayName, db)
			if err != nil {
				c.AbortWithStatusJSON(500, "Unable to create new user :(")
				return
			}
		}

		c.JSON(200, User{
			UID:           user.UID,
			Username:      username,
			DisplayName:   displayName,
			ProfilePicURL: profilePicURL,
			MovieList:     movieList,
			TVList:        tvList,
		})
	}
}

func createUser(uid string, email string, displayName string, db *database.DB) error {
	username := getRandomName()
	//todo get a new name if user with username already exists!!
	if len(displayName) > 20 {
		displayName = displayName[:20]
	}
	if len(username) > 20 {
		username = username[:20]
	}
	insert, err := db.Db.Prepare(`INSERT INTO account (uid, email, profile_picture_url, username, display_name) 
											VALUES ($1, $2, default, $3, $4)`)
	if err != nil {
		return err
	}

	//Execute the previous sql query using data from the
	// userData struct being passed into the function
	_, err = insert.Exec(uid, email, username, displayName)

	if err != nil {
		return err
	}
	return nil
}

func updateUsername(uid string, username string, db *database.DB) (error, string, string, string) {
	if len(username) > 20 {
		username = username[:20]
	}
	row := db.Db.QueryRow(`UPDATE account SET username=$1 WHERE uid=$2
											returning username, display_name, profile_picture_url`, username, uid)

	var displayName string
	var profilePicURL string
	err := row.Scan(&username, &displayName, &profilePicURL)

	if err != nil {
		return err, "", "", ""
	}
	return nil, username, displayName, profilePicURL
}

func updateDisplayName(uid string, displayName string, db *database.DB) (error, string) {
	if len(displayName) > 20 {
		displayName = displayName[:20]
	}
	row := db.Db.QueryRow(`UPDATE account SET display_name=$1 WHERE uid=$2
									returning display_name`, displayName, uid)

	err := row.Scan(&displayName)

	if err != nil {
		return err, ""
	}
	return nil, displayName
}

func GetUser(uid string, db *database.DB) (string, string, string, []Movie, []TV) {
	// Prepare the sql query for later
	var username string
	var displayName string
	var profilePicURL string
	var movieList []Movie
	var tvList []TV

	err := db.Db.QueryRow(`SELECT username, display_name, profile_picture_url 
									FROM account WHERE uid = $1`, uid).Scan(&username, &displayName, &profilePicURL)
	PanicOnErr(err)

	query, err := db.Db.Query(`SELECT movie.id, movie.name, COALESCE(poster_path, ''), COALESCE(movie.overview, ''), status
										FROM movie JOIN movie_user_bridge mub on movie.id = mub.movie_id
										JOIN account a on a.uid = mub.user_id
											WHERE uid=$1 ORDER BY status, name`, uid)
	PanicOnErr(err)
	for query.Next() {
		var movie Movie
		err = query.Scan(&movie.ID, &movie.Name, &movie.PosterPath, &movie.Overview, &movie.Status)
		if err != nil {
			return "", "", "", nil, nil
		}

		movieList = append(movieList, movie)
	}

	query, err = db.Db.Query(`SELECT tv.id, tv.name, COALESCE(poster_path, ''), COALESCE(tv.overview, '') , status
										FROM tv JOIN tv_user_bridge mub on tv.id = mub.tv_id
										JOIN account a on a.uid = mub.user_id
											WHERE uid=$1 ORDER BY status, tv.name`, uid)
	PanicOnErr(err)
	for query.Next() {
		var show TV
		err = query.Scan(&show.ID, &show.Name, &show.PosterPath, &show.Overview, &show.Status)
		if err != nil {
			return "", "", "", nil, nil
		}
		tvList = append(tvList, show)
	}

	return username, displayName, profilePicURL, movieList, tvList
}

func handleChangeUsername(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		newUsername := c.DefaultQuery("username", "")

		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}

		err, newUsername, displayName, profilePicURL := updateUsername(user.UID, newUsername, db)
		if err != nil {
			c.AbortWithStatusJSON(500, "Unable to update username. Sorry.")
			return
		}

		c.JSON(200, User{
			Username:      newUsername,
			DisplayName:   displayName,
			ProfilePicURL: profilePicURL,
		})
	}
}

func handleChangeDisplayName(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		newDisplayName := c.DefaultQuery("displayName", "")

		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}

		err, newDisplayName := updateDisplayName(user.UID, newDisplayName, db)
		if err != nil {
			c.AbortWithStatusJSON(500, "Unable to update username. Sorry.")
			return
		}

		c.JSON(200, User{
			DisplayName: newDisplayName,
		})
	}
}

func PanicOnErr(err error) {
	if err != nil && err.Error() != "sql: no rows in result set" {
		panic(err)
	}
}
