import {useDispatch, useSelector} from "react-redux";
import {set, UserState} from "../Store/userSlice";
import React from "react";
import {Link} from "react-router-dom";

export type Movie = {
    id: number,
    original_title: string,
    poster_path: string,
    status: string,
    overview: string,
    release_date: string
}

export function Movie(props: { movie: Movie, compact: boolean }) {
    const user = useSelector((state: {user:UserState }) => state.user).user;
    const dispatch = useDispatch()

    function addMovieToWatchlist(id: number, status: string) {
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
                    console.log(result)
                }, (error) => {

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
    return (
        <div className="film">
            <div className={"film-details"}>
                <div className={"name"}><Link to={"/movie/"+props.movie.id}>{props.movie.original_title}</Link></div>
                <div className={"release-date"}>{props.movie.release_date}</div>
                <div className={"status-" + props.movie.status}>{props.movie.status}</div>
                <div className={"overview"}>{!props.compact && props.movie.overview}</div>

                <div className={"status-buttons"}>
                    <button onClick={() => deleteFromWatchlist(props.movie.id)}
                            className={"delete"}>Remove</button>
                    <button className={"add-to-watchlist"}
                            tabIndex={3}
                            disabled={props.movie.status === "plan-to-watch"}
                            onClick={() => addMovieToWatchlist(props.movie.id, "plan-to-watch")}>
                        Plan-to-watch
                    </button>
                    <button className={"started"}
                            tabIndex={3}
                            disabled={props.movie.status === "started"}
                            onClick={() => addMovieToWatchlist(props.movie.id, "started")}>
                        Started
                    </button>
                    <button className={"completed"}
                            tabIndex={3}
                            disabled={props.movie.status === "completed"}
                            onClick={() => addMovieToWatchlist(props.movie.id, "completed")}>
                        Completed
                    </button>
                </div>
            </div>
            <img src={(props.movie.poster_path === "" || props.movie.poster_path === null) ?
                 "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg" :
                 "https://image.tmdb.org/t/p/w500/" + props.movie.poster_path}
                 className={"poster"}
                 alt={"show-poster"}/>
        </div>
    )
}

export function TrendingMovie(props: { movie: Movie }){
    return (
        <div className={"trending-film"}>
            <Link to={"/movie/"+props.movie.id}>
                <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} className={"poster"}
                                      alt={"movie-poster"}/>
            </Link>
            <div className={"name"}><Link to={"/movie/"+props.movie.id}>{props.movie.original_title}</Link></div>
            <div className={"air-date"}>{props.movie.release_date}</div>
        </div>
    )
}