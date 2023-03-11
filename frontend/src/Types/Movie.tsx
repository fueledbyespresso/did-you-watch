import {useDispatch, useSelector} from "react-redux";
import {set, UserState} from "../Store/userSlice";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

export type Movie = {
    id: number,
    original_title: string,
    poster_path: string,
    backdrop_path: string,
    status: string,
    overview: string,
    release_date: string
}

const status_types = [
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
    {value: 'rewatching', label: 'Rewatching'},
    {value: 'dropped', label: 'Dropped'},
]

export function Movie(props: { movie: Movie, searchResult: boolean  }) {
    const user = useSelector((state: { user: UserState }) => state.user).user;
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [curMovieStatus, setCurMovieStatus] = useState<string | null>(null)

    useEffect(() => {
        let matchingShow = user.movieList.filter(obj => {
            return obj.id === props.movie.id
        })
        if (matchingShow.length > 0) {
            setCurMovieStatus(matchingShow[0].status)
        }
    }, [user]);

    function addMovieToWatchlist(id: number, status: string) {
        setLoading(true)
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/" + id + "/" + status, {
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
                    let index = -1;
                    for (let i = 0; i < tempUser.movieList.length; i++) {
                        if (tempUser.movieList[i].id === result.id) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUser.movieList[index] = result
                    } else {
                        tempUser.movieList.unshift(result)
                    }

                    dispatch(set(tempUser))
                    setLoading(false)
                }, (error) => {
                    setLoading(false)
                }
            )
    }

    function deleteFromWatchlist(id: number) {
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/" + id, {
            method: "DELETE",
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
                    for (let i = 0; i < tempUser.movieList.length; i++) {
                        if (tempUser.movieList[i].id === id) {
                            tempUser.movieList.splice(i, 1)
                            break;
                        }
                    }

                    dispatch(set(tempUser))
                    console.log(result)
                }, (error) => {

                }
            )
    }
    if (props.searchResult) {
        return (
            <div className="film">
                <div className={"film-details"}>
                    <div className={"text-details"}>
                        <div className={"name"}>
                            <Link to={"/movie/" + props.movie.id}>
                                {props.movie.original_title}
                                <div className={"status"}>{props.movie.status}</div>
                            </Link>
                        </div>
                        <div>
                            {user.movieList.some(e => e.id === props.movie.id) && "In watchlist"}
                        </div>
                        <div className={"release-date"}>{props.movie.release_date}</div>
                        <div className={"overview"}>{props.movie.overview}</div>
                    </div>
                    <img src={(props.movie.poster_path === "" || props.movie.poster_path === null) ?
                        "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg" :
                        "https://image.tmdb.org/t/p/w500/" + props.movie.poster_path}
                         className={"poster"}
                         alt={"show-poster"}/>
                </div>

                <div className={"status-buttons"}>
                    {status_types.map((status) => (
                        <button className={status.value}
                                key={status.value}
                                tabIndex={3}
                                disabled={curMovieStatus === status.value}
                                onClick={() => addMovieToWatchlist(props.movie.id, status.value)}>
                            {status.label}
                        </button>
                    ))}
                    <button onClick={() => deleteFromWatchlist(props.movie.id)}
                            className={"delete"}>Remove
                    </button>
                    {loading && <button>Loading...</button>}
                </div>
            </div>
        )
    }

    return (
        <div className={"watchlist-film"}>
            <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} alt={""}/>
            <div className={"details"}>
                <div className={"text-details"}>
                    <div className={"name"}><Link to={"/show/" + props.movie.id}>{props.movie.original_title}</Link></div>
                    <div className={"status"}>{props.movie.status}</div>
                    {loading && <div>Loading...</div>}
                </div>
                <div className={"status-buttons"}>
                    {status_types.map((status) => (
                        <button className={status.value}
                                key={status.value}
                                tabIndex={3}
                                disabled={curMovieStatus === status.value}
                                onClick={() => addMovieToWatchlist(props.movie.id, status.value)}>
                            {status.label}
                        </button>
                    ))}
                    <button onClick={() => deleteFromWatchlist(props.movie.id)}
                            className={"delete"}>Remove
                    </button>
                </div>
            </div>
        </div>
    )
}

export function TrendingMovie(props: { movie: Movie }) {
    return (
        <div className={"trending-film"}>
            <Link to={"/movie/" + props.movie.id}>
                <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} className={"poster"}
                     alt={"movie-poster"}/>
            </Link>
            <div className={"name"}><Link to={"/movie/" + props.movie.id}>{props.movie.original_title}</Link></div>
            <div className={"air-date"}>{props.movie.release_date}</div>
        </div>
    )
}