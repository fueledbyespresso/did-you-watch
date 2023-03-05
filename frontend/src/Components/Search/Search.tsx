import {useEffect, useState} from "react";
import Select from "react-select";
import {SearchResult} from "./SearchResult";
import {set} from "../../Store/userSlice";
import {useDispatch, useSelector} from "react-redux";
import {User} from "../../Types/User";
import {Show} from "../../Types/Show";
import {Movie} from "../../Types/Movie";

const options = [
    {value: 'tv', label: 'TV'},
    {value: 'movie', label: 'Movie'},
    {value: 'users', label: 'Users'},
]

export function Search() {
    const [curCategory, setCurCategory] = useState<string | undefined>("tv")
    const [searchQuery, setSearchQuery] = useState<String>("")
    const [movieResults, setMovieResults] = useState<any>(null)
    const [TVResults, setTVResults] = useState<any>(null)
    const [userResults, setUserResults] = useState<any>(null)

    function submitSearch(searchCategory: string | null | undefined) {
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
                    if (searchCategory == "movie") {
                        setMovieResults(result)
                    } else if(searchCategory == "tv"){
                        setTVResults(result)
                    } else if(searchCategory == "users"){
                        setUserResults(result)
                    }
                }, (error) => {

                }
            )
    }

    return (
        <div className={"search-area"} tabIndex={3}>
            <div className={"search-bar"}>
                <Select options={options}
                        tabIndex={1}
                        defaultValue={{value: 'tv', label: 'TV'}}
                        onChange={(values) => setCurCategory(values?.value)}
                        className="category-select"/>

                <input className={"search-input"}
                       tabIndex={2}
                       value={searchQuery as any}
                       onChange={event => setSearchQuery(event.target.value)}
                       onKeyDown={(e) => (e.key === 'Enter' ? submitSearch(curCategory) : null)}
                       placeholder={"The Last of Us..."}
                autoFocus={true}/>

                <button tabIndex={3}
                        onClick={() => submitSearch(curCategory)}>
                    Search
                </button>
            </div>

            <div className="results">
                {curCategory === "movie" && (
                    movieResults !== null && movieResults.results.length !== 0 ?
                        movieResults.results.map((movie: Movie) => {
                            return (
                                <Movie key={movie.id}
                                       movie={movie}/>
                            )
                }) : (
                    movieResults !== null && movieResults.results.length === 0 && (
                        <div>No results</div>
                    )
                ))}
                {curCategory === "tv" && (
                    TVResults !== null && TVResults.results.length !== 0 ?
                        TVResults.results.map((show: Show) => {
                            return (
                                <Show key={Number(show.id)}
                                      show={show}/>
                        )
                }) : (
                    TVResults !== null && TVResults.results.length === 0 && (
                        <div>No results</div>
                    )
                ))}
                {curCategory === "users" && (
                    userResults !== null && userResults.length !== 0 ?
                        userResults.map((user: User) => {
                            return (
                                <User key={user.uid}
                                      user={user}/>
                            )
                    }) : (
                    userResults !== null && userResults.length === 0 && (
                                <div>No results</div>
                    )
                ))}
            </div>
        </div>
    )
}
