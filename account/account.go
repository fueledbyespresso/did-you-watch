package account

import (
	"did-you-watch/database"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"fmt"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
	"log"
	"regexp"
	"strconv"
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
	DarkMode      bool    `json:"darkMode"`
}

type Movie struct {
	ID           int    `json:"id"`
	Name         string `json:"original_title"`
	PosterPath   string `json:"poster_path"`
	Status       string `json:"status"`
	Overview     string `json:"overview"`
	BackdropPath string `json:"backdrop_path"`
}

type TV struct {
	ID              int    `json:"id"`
	Name            string `json:"original_name"`
	PosterPath      string `json:"poster_path"`
	Status          string `json:"status"`
	Overview        string `json:"overview"`
	EpisodesWatched int    `json:"episodes_watched"`
	TotalEpisodes   int    `json:"total_episodes"`
	BackdropPath    string `json:"backdrop_path"`
}

// Routes All the routes created by the package nested in
// oauth/v1/*
func Routes(r *gin.RouterGroup, db *database.DB) {
	r.GET("/login", handleLogin(db))
	r.POST("/signup", handleSignUp(db))
	r.PUT("/toggleDarkMode", toggleDarkMode(db))
	r.PUT("/username/:newUsername", handleChangeUsername(db))
	r.PUT("/displayName/:newDisplayName", handleChangeDisplayName(db))
	r.PUT("/avatar/:avatarID", handleChangeAvatar(db))
	r.GET("/avatars", getAvatars(db))
}

func GetUserRecord(c *gin.Context) *auth.UserRecord {
	idToken := c.GetHeader("AuthToken")
	if idToken == "" {
		c.AbortWithStatusJSON(400, "Missing AuthToken header")

		return nil
	}
	opt := option.WithCredentialsJSON([]byte(database.GetEnvOrParam("FIREBASE_CREDS", "FIREBASE_CREDS")))

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

func userExists(uid string, db *database.DB) bool {
	count := 0
	err := db.Db.QueryRow(`SELECT count(*) FROM account WHERE uid = $1`, uid).Scan(&count)
	if err != nil {
		return false
	}
	return count != 0
}

func handleLogin(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}
		err := createUserIfNotExist(user, c, db)
		if err != nil {
			c.AbortWithStatusJSON(500, "Server was unable to create a user on first login")
			return
		}

		username, displayName, profilePicURL, movieList, tvList, darkMode := GetUser(user.UID, db)
		if username == "" {
			c.AbortWithStatusJSON(500, "Unable to get user")
			return
		}

		c.JSON(200, User{
			UID:           user.UID,
			Username:      username,
			DisplayName:   displayName,
			ProfilePicURL: profilePicURL,
			MovieList:     movieList,
			TVList:        tvList,
			DarkMode:      darkMode,
		})
	}
}

func createUserIfNotExist(user *auth.UserRecord, c *gin.Context, db *database.DB) error {
	if _, ok := user.CustomClaims["synced"]; !ok {
		//todo generate new random username on conflict
		opt := option.WithCredentialsJSON([]byte(database.GetEnvOrParam("FIREBASE_CREDS", "FIREBASE_CREDS")))
		app, err := firebase.NewApp(c, nil, opt)
		client, err := app.Auth(c)
		if userExists(user.UID, db) {
			// User is present in database but not marked in firebase. Weird.
			err = client.SetCustomUserClaims(c, user.UID, map[string]interface{}{"synced": true})
			return err
		} else {
			newUsername := getRandomName()
			formattedDisplayName := user.DisplayName
			if len(formattedDisplayName) > 20 {
				formattedDisplayName = formattedDisplayName[:20]
			}
			err = createUser(user.UID, user.Email, formattedDisplayName, newUsername, db)
			if err != nil {
				return err
			}

			if err != nil {
				return err
			}
			_ = client.SetCustomUserClaims(c, user.UID, map[string]interface{}{"synced": true})
		}
	}

	return nil
}

type NewUser struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	Username    string `json:"username"`
	DisplayName string `json:"displayname"`
}

func handleSignUp(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var requestBody NewUser
		if err := c.BindJSON(&requestBody); err != nil {
			c.AbortWithStatusJSON(400, "Unable to create user. New user data is in an invalid format.")
			return
		}
		dnIsAlphanumeric := regexp.MustCompile(`^[a-zA-Z0-9]*$`).MatchString(requestBody.DisplayName)
		unIsAlphanumeric := regexp.MustCompile(`^[a-zA-Z0-9]*$`).MatchString(requestBody.Username)

		if !dnIsAlphanumeric || !unIsAlphanumeric {
			c.AbortWithStatusJSON(400, "Username or displayname does not meet requirements. Must be 2-20 characters long. Must be alphanumeric.")
			return
		}

		if !usernameIsUnique(requestBody.Username, db) {
			c.AbortWithStatusJSON(409, "Username already in use.")
			return
		}

		opt := option.WithCredentialsJSON([]byte(database.GetEnvOrParam("FIREBASE_CREDS", "FIREBASE_CREDS")))
		app, err := firebase.NewApp(c, nil, opt)
		client, err := app.Auth(c)

		params := (&auth.UserToCreate{}).
			Email(requestBody.Email).
			EmailVerified(false).
			Password(requestBody.Password).
			Disabled(false)
		user, err := client.CreateUser(c, params)
		if err != nil {
			c.AbortWithStatusJSON(400, err)
		}
		err = createUser(user.UID, user.Email, requestBody.DisplayName, requestBody.Username, db)
		if err != nil {
			c.AbortWithStatusJSON(500, "User could not be saved to database after creation. Deleting user.")

			err = client.DeleteUser(c, user.UID)
			if err != nil {
				log.Fatalf("User was created in Firebase. User was not able to be saved in database. "+
					"User was not able to be removed from database. "+
					"Failure unrecoverable. Server and Firebase out of sync. Error from firebase: %v", err)
			}
			return
		}
		_ = client.SetCustomUserClaims(c, user.UID, map[string]interface{}{"synced": true})
		token, err := client.CustomToken(c, user.UID)
		if err != nil {
			c.AbortWithStatusJSON(400, "User created but custom token could not be minted")
			return
		}
		c.JSON(200, token)
	}
}

func usernameIsUnique(username string, db *database.DB) bool {
	var count int
	err := db.Db.QueryRow(`SELECT count(*) FROM account WHERE upper(username) = upper($1)`, username).Scan(&count)
	if err != nil {
		return false
	}
	return count == 0
}

func createUser(uid string, email string, displayName string, username string, db *database.DB) error {

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

func GetUser(uid string, db *database.DB) (string, string, string, []Movie, []TV, bool) {
	// Prepare the sql query for later
	var username string
	var displayName string
	var profilePicURL string
	var darkMode bool
	movieList := []Movie{}
	tvList := []TV{}

	err := db.Db.QueryRow(`SELECT username, display_name, a.image_url, dark_mode FROM account
       JOIN avatar a on a.id = account.profile_picture_url
       WHERE uid = $1`, uid).Scan(&username, &displayName, &profilePicURL, &darkMode)
	PanicOnErr(err)

	query, err := db.Db.Query(`SELECT movie.id, movie.name, COALESCE(poster_path, ''), COALESCE(movie.overview, ''), status, COALESCE(backdrop_path, '')
										FROM movie JOIN (SELECT movie_id, user_id, MAX(status) as status, MAX(timestamp) as timestamp FROM movie_user_bridge GROUP BY (movie_id, user_id)) mub on movie.id = mub.movie_id
										JOIN account a on a.uid = mub.user_id
											WHERE uid=$1 ORDER BY name`, uid)
	if err != nil {
		return "", "", "", []Movie{}, []TV{}, false
	}
	for query.Next() {
		var movie Movie
		err = query.Scan(&movie.ID, &movie.Name, &movie.PosterPath, &movie.Overview, &movie.Status, &movie.BackdropPath)
		if err != nil {
			return "", "", "", []Movie{}, []TV{}, false
		}

		movieList = append(movieList, movie)
	}

	query, err = db.Db.Query(`SELECT tv.id, tv.name, COALESCE(poster_path, ''), COALESCE(tv.overview, '') , status, total_episodes, COALESCE(backdrop_path, '')
										FROM tv JOIN (SELECT tv_id, user_id, MAX(status) as status, MAX(timestamp) as timestamp FROM tv_user_bridge GROUP BY (tv_id, user_id)) mub on tv.id = mub.tv_id
										JOIN account a on a.uid = mub.user_id
											WHERE uid=$1 ORDER BY tv.name`, uid)
	PanicOnErr(err)
	for query.Next() {
		var show TV
		err = query.Scan(&show.ID, &show.Name, &show.PosterPath, &show.Overview, &show.Status, &show.TotalEpisodes, &show.BackdropPath)
		if err != nil {
			return "", "", "", []Movie{}, []TV{}, false
		}
		tvList = append(tvList, show)
	}

	return username, displayName, profilePicURL, movieList, tvList, darkMode
}

func toggleDarkMode(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}
		var darkMode bool
		err := db.Db.QueryRow(`UPDATE account SET dark_mode=NOT dark_mode WHERE uid=$1 returning dark_mode`, user.UID).Scan(&darkMode)
		if err != nil {
			c.AbortWithStatusJSON(500, "Unable to toggle dark mode")
			return
		}

		c.JSON(200, darkMode)
	}
}

func handleChangeUsername(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		newUsername := c.Param("newUsername")

		var count int
		err := db.Db.QueryRow(`SELECT count(*) FROM account WHERE upper(username) = upper($1)`, newUsername).Scan(&count)
		if err != nil {
			c.AbortWithStatusJSON(500, "Could not check if username was unique.")
			return
		}
		if count != 0 {
			c.AbortWithStatusJSON(400, "Username must be unique")
			return
		}

		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}

		if len(newUsername) > 20 {
			newUsername = newUsername[:20]
		}
		row := db.Db.QueryRow(`UPDATE account SET username=$1 WHERE uid=$2
											returning username, display_name, profile_picture_url`, newUsername, user.UID)

		var displayName string
		var profilePicURL string
		err = row.Scan(&newUsername, &displayName, &profilePicURL)
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(500, "Unable to update username.")
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
		newDisplayName := c.Param("newDisplayName")

		var count int
		err := db.Db.QueryRow(`SELECT count(*) FROM account WHERE upper(username) = upper($1)`, newDisplayName).Scan(&count)
		if err != nil {
			c.AbortWithStatusJSON(500, "Could not check if display name was unique.")
			return
		}
		if count != 0 {
			c.AbortWithStatusJSON(400, "Display name must be unique")
			return
		}

		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}

		if len(newDisplayName) > 20 {
			newDisplayName = newDisplayName[:20]
		}
		row := db.Db.QueryRow(`UPDATE account SET display_name=$1 WHERE uid=$2
											returning display_name, username, profile_picture_url`, newDisplayName, user.UID)

		var username string
		var profilePicURL string
		err = row.Scan(&newDisplayName, &username, &profilePicURL)
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(500, "Unable to update display name.")
			return
		}

		c.JSON(200, User{
			Username:      username,
			DisplayName:   newDisplayName,
			ProfilePicURL: profilePicURL,
		})
	}
}

func getAvatars(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query, err := db.Db.Query(`SELECT id, image_url FROM avatar`)
		if err != nil {
			c.AbortWithStatusJSON(500, "Unable to get avatars.")
			return
		}
		avatars := make(map[int]string)
		var id int
		var url string
		for query.Next() {
			err = query.Scan(&id, &url)
			if err != nil {
				c.AbortWithStatusJSON(500, "Unable to get avatars.")
				return
			}
			avatars[id] = url
		}

		c.JSON(200, avatars)
	}
}
func handleChangeAvatar(db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		newAvatarID, err := strconv.Atoi(c.Param("avatarID"))
		if err != nil {
			c.AbortWithStatusJSON(400, "Invalid ID. Must be integer.")
			return
		}

		var count int
		err = db.Db.QueryRow(`SELECT count(*) FROM avatar WHERE id=$1`, newAvatarID).Scan(&count)
		if err != nil {
			c.AbortWithStatusJSON(500, "Could not check if avatar exists.")
			return
		}
		if count == 0 {
			c.AbortWithStatusJSON(400, "Avatar does not exist.")
			return
		}

		user := GetUserRecord(c)
		if user == nil {
			c.AbortWithStatusJSON(500, "Unable to verify token")
			return
		}

		row := db.Db.QueryRow(`UPDATE account SET profile_picture_url=$1 WHERE uid=$2
											returning display_name, username, (SELECT image_url FROM avatar WHERE id=$1)`, newAvatarID, user.UID)

		var username string
		var displayName string
		var profilePicURL string
		err = row.Scan(&displayName, &username, &profilePicURL)
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(500, "Unable to update display name.")
			return
		}

		c.JSON(200, User{
			Username:      username,
			DisplayName:   displayName,
			ProfilePicURL: profilePicURL,
		})
	}
}

func PanicOnErr(err error) {
	if err != nil && err.Error() != "sql: no rows in result set" {
		panic(err)
	}
}
