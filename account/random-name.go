package account

import (
	"fmt"
	"math/rand"
	"time"
)

var (
	// ADJECTIVES ...
	ADJECTIVES = []string{"autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark", "summer",
		"icy", "delicate", "quiet", "white", "cool", "spring", "winter", "patient",
		"twilight", "dawn", "crimson", "wispy", "weathered", "blue", "billowing",
		"broken", "cold", "damp", "falling", "frosty", "green", "long", "late", "lingering",
		"bold", "little", "morning", "muddy", "old", "red", "rough", "still", "small",
		"sparkling", "throbbing", "shy", "wandering", "withered", "wild", "black",
		"young", "holy", "solitary", "fragrant", "aged", "snowy", "proud", "floral",
		"restless", "divine", "polished", "ancient", "purple", "lively", "nameless", "attractive",
		"bald", "beautiful", "chubby", "clean", "dazzling", "drab", "elegant", "fancy", "fit",
		"flabby", "glamorous", "gorgeous", "handsome", "long", "magnificent", "muscular", "plain", "plump",
		"quaint", "scruffy", "shapely", "short", "skinny", "stocky", "ugly", "unkempt", "unsightly"}
	// NOUNS ...
	NOUNS = []string{"waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
		"snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest",
		"hill", "cloud", "meadow", "sun", "glade", "bird", "brook", "butterfly",
		"bush", "dew", "dust", "field", "fire", "flower", "firefly", "feather", "grass",
		"haze", "mountain", "night", "pond", "darkness", "snowflake", "silence",
		"sound", "sky", "shape", "surf", "thunder", "violet", "water", "wildflower",
		"wave", "water", "resonance", "sun", "wood", "dream", "cherry", "tree", "fog",
		"frost", "voice", "paper", "frog", "smoke", "star"}
)

// Generate ...
func getRandomName() string {
	seed := rand.NewSource(time.Now().UTC().UnixNano())
	random := rand.New(seed)

	randomAdjective := ADJECTIVES[random.Intn(len(ADJECTIVES))]
	randomNoun := NOUNS[random.Intn(len(NOUNS))]
	randomNum := random.Int63()

	randomName := fmt.Sprintf("%v-%v-%d", randomAdjective, randomNoun, randomNum)

	return randomName
}
