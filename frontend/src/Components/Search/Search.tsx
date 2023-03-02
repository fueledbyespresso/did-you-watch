import {useEffect, useState} from "react";
import Select from "react-select";
import {SearchResult} from "./SearchResult";
import {set} from "../../Store/userSlice";
import {useDispatch, useSelector} from "react-redux";
import {User} from "../../interfaces/User";

const options = [
    {value: 'tv', label: 'TV'},
    {value: 'movie', label: 'Movie'},
]

export function Search() {
    const [curCategory, setCurCategory] = useState<string | undefined>("tv")
    const [searchQuery, setSearchQuery] = useState<String>("")
    const [movieResults, setMovieResults] = useState<any>(null)
    const [TVResults, setTVResults] = useState<any>(null)

    const userState = useSelector((state: any) => state.user);
    const [user, setUser] = useState<User>(userState.user)
    const dispatch = useDispatch()
    useEffect(() => {
        setUser(userState.user)
    }, [userState]);

    function submitSearch(searchCategory: string | null | undefined) {
        fetch(process.env.REACT_APP_HOST + "/api/v1/" + searchCategory + "/" + searchQuery, {
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
                    } else {
                        setTVResults(result)
                    }
                }, (error) => {

                }
            )
    }

    function addToWatchList(id: string, status: string, category: string) {
        fetch(process.env.REACT_APP_HOST + "/api/v1/" + category + "/" + id + "/" + status, {
            method: "PUT",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    if (category == "tv") {
                        let index = -1;
                        for (let i = 0; i < tempUser.tvList.length; i++) {
                            if (tempUser.tvList[i].ID === result.ID) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1) {
                            tempUser.tvList[index] = result
                        } else {
                            tempUser.tvList.push(result)
                        }
                    } else if (category == "movie") {
                        let index = -1;
                        console.log(tempUser)
                        for (let i = 0; i < tempUser.movieList.length; i++) {
                            if (tempUser.movieList[i].ID === result.ID) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1) {
                            tempUser.movieList[index] = result
                        } else {
                            tempUser.movieList.push(result)
                        }
                    }

                    dispatch(set(tempUser))
                    console.log(result)
                }, (error) => {

                }
            )
    }

    return (
        <div className={"search-area"} tabIndex={0}>
            <div className={"search-bar"}>
                <Select options={options}
                        defaultValue={{value: 'tv', label: 'TV'}}
                        onChange={(values) => setCurCategory(values?.value)}
                        className="category-select"/>

                <input className={"search-input"}
                       value={searchQuery as any}
                       onChange={event => setSearchQuery(event.target.value)}
                       onKeyDown={(e) => (e.key === 'Enter' ? submitSearch(curCategory) : null)}
                       placeholder={"The Last of Us..."}/>

                <button onClick={() => submitSearch(curCategory)}>Search</button>
            </div>

            <div className="results">
                {curCategory == "movie" && (
                    movieResults != null && movieResults.results.length != 0 ?
                        Object.keys(movieResults.results).map((key) => {
                            return (
                                <SearchResult key={key}
                                              addToWatchlist={addToWatchList}
                                              category={curCategory}
                                              result={movieResults.results[key]}/>
                            )
                        }) : (
                            movieResults != null && movieResults.results.length == 0 && (
                                <div>No results</div>
                            )
                        )
                )}
                {curCategory == "tv" && (
                    TVResults != null && TVResults.results.length != 0 ?
                        Object.keys(TVResults.results).map((key) => {
                            return (
                                <SearchResult key={key}
                                              addToWatchlist={addToWatchList}
                                              category={curCategory}
                                              result={TVResults.results[key]}/>
                            )
                        }) : (
                            TVResults != null && TVResults.results.length == 0 && (
                                <div>No results</div>
                            )
                        )
                )}
            </div>
        </div>
    )
}
