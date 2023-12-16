import React, {useState} from "react";
import Select from "react-select";
import {User} from "../../Types/User";
import {Movie} from "../../Types/Movie";
import {Show} from "../../Types/Show";
import {SearchResultShowCard} from "../ShowCards/SearchResultShowCard";
import {WatchlistShowCard} from "../ShowCards/WatchlistShowCard";
import {WatchlistSMovieCard} from "../MovieCards/WatchlistSMovieCard";
import {SearchResultMovieCard} from "../MovieCards/SearchResultMovieCard";
import {ActorResultCard} from "./ActorResultCard";

const options = [
    {value: 'multi', label: 'Multi'},
    {value: 'tv', label: 'TV'},
    {value: 'movie', label: 'Movie'},
    {value: 'users', label: 'Users'},
]

export function Search() {
    const [curCategory, setCurCategory] = useState<string | undefined>("multi")
    const [searchQuery, setSearchQuery] = useState<String>("")
    const [searchResults, setSearchResults] = useState<any>(null)

    function submitSearch(searchCategory: string | null | undefined) {
        if (searchQuery === ""){
            setSearchResults(null)
            return
        }
        fetch(process.env.REACT_APP_HOST + "/api/v1/search/" + searchCategory + "/" + searchQuery, {
            method: "GET",
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    setSearchResults(result.results)
                }, (error) => {

                }
            )
    }

    return (
        <div className={"search-area"} tabIndex={3}>
            <div className={"search-bar"}>
                <Select options={options}
                        tabIndex={1}
                        defaultValue={{value: 'multi', label: 'Multi'}}
                        onChange={(values) => setCurCategory(values?.value)}
                        className="category-select"/>

                <input className={"search-input"}
                       tabIndex={2}
                       value={searchQuery as any}
                       onChange={event => setSearchQuery(event.target.value)}
                       onKeyUp={(e) => (submitSearch(curCategory))}
                       placeholder={"The Last of Us..."}
                       autoFocus={true}/>
            </div>

            <div className="results">
                {searchResults !== null && searchResults.map((searchResult: any) => {
                    switch (searchResult.media_type) {
                        case "tv":
                            return <SearchResultShowCard show={searchResult} key={searchResult.id}/>
                        case "movie":
                            return <SearchResultMovieCard movie={searchResult} key={searchResult.id}/>
                        case "user":
                            return <User user={searchResult}/>
                        case "person":
                            return <ActorResultCard actor={searchResult} actorID={searchResult.id}/>
                        default: return <div></div>
                    }
                })}
            </div>
        </div>
    )
}
