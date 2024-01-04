package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/antonlindstrom/pgstore"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
	"github.com/aws/aws-sdk-go/service/ssm"
	"github.com/aws/aws-sdk-go/service/ssm/ssmiface"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"log"
	"net/http"
	"os"
)

type DB struct {
	Db           *sql.DB
	SessionStore *pgstore.PGStore
}

// InitDBConnection Initialize a database connection using the environment variable DATABASE_URL
// Returns type *sql.DB
func InitDBConnection() *sql.DB {
	db, err := sql.Open("postgres", getDbURL())
	// if there is an error opening the connection, handle it
	if err != nil {
		fmt.Println("Cannot establish SQL connection")
		panic(err.Error())
	}
	db.SetMaxOpenConns(15)
	return db
}

func InitOauthStore() *pgstore.PGStore {
	var err error

	SessionStore, err := pgstore.NewPGStore(os.Getenv("DATABASE_URL"), []byte(os.Getenv("DATABASE_SECRET")))
	if err != nil {
		panic(err)
	}

	SessionStore.MaxAge(1800)
	SessionStore.Options.SameSite = http.SameSiteLaxMode
	SessionStore.Options.HttpOnly = true
	if os.Getenv("ENV") == "DEV" {
		SessionStore.Options.Secure = false
	} else {
		SessionStore.Options.Secure = true
	}
	fmt.Println("Successful connected to oauth session datastore")
	return SessionStore
}

// PerformMigrations Check that database is up-to-date.
// Will cycle through all changes in db/migrations until the database is up-to-date
func PerformMigrations(migrationsFolder string) {
	m, err := migrate.New(
		migrationsFolder,
		getDbURL())
	if err != nil {
		log.Fatal(err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal(err)
	}
	fmt.Println("Database migrations completed. Database should be up to date.")
}

func getDbURL() string {
	if os.Getenv("ENV") == "DEV" {
		return os.Getenv("DATABASE_URL")
	} else {
		ssmsvc := NewSSMClient()
		RDSSecretName, err := ssmsvc.Param("rds_secret_name", true).GetValue()
		if err != nil {
			panic(err)
		}
		endpoint, err := ssmsvc.Param("rds_endpoint", true).GetValue()
		if err != nil {
			panic(err)
		}
		var jsonMap map[string]interface{}
		svc := secretsmanager.New(session.Must(session.NewSession(&aws.Config{
			Region: aws.String("us-west-2")},
		)))
		input := &secretsmanager.GetSecretValueInput{
			SecretId: aws.String(RDSSecretName),
		}

		RDSLoginStr, err := svc.GetSecretValue(input)
		fmt.Println(RDSSecretName, RDSLoginStr)
		if err != nil {
			panic(err)
		}
		err = json.Unmarshal([]byte(RDSLoginStr.String()), &jsonMap)
		if err != nil {
			panic(err)
		}
		return "postgres://postgres:" + fmt.Sprintf("%v", jsonMap["password"]) + "@" + endpoint + ":5432/did_you_watch"
	}
}

type SSM struct {
	client ssmiface.SSMAPI
}

func Sessions() (*session.Session, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-west-2")},
	)
	svc := session.Must(sess, err)
	return svc, err
}

func NewSSMClient() *SSM {
	// Create AWS Session
	sess, err := Sessions()
	if err != nil {
		log.Println(err)
		return nil
	}
	ssmsvc := &SSM{ssm.New(sess)}
	// Return SSM client
	return ssmsvc
}

type Param struct {
	Name           string
	WithDecryption bool
	ssmsvc         *SSM
}

//Param creates the struct for querying the param store
func (s *SSM) Param(name string, decryption bool) *Param {
	return &Param{
		Name:           name,
		WithDecryption: decryption,
		ssmsvc:         s,
	}
}

func (p *Param) GetValue() (string, error) {
	ssmsvc := p.ssmsvc.client
	parameter, err := ssmsvc.GetParameter(&ssm.GetParameterInput{
		Name:           &p.Name,
		WithDecryption: &p.WithDecryption,
	})
	if err != nil {
		return "", err
	}
	value := *parameter.Parameter.Value
	return value, nil
}
