import {useDispatch, useSelector} from "react-redux";
import {set, UserState} from "../Store/userSlice";
import React from "react";

export type Movie = {
    id: number,
    original_title: string,
    poster_path: string,
    status: string,
    overview: string,
    release_date: string
}

export function Movie(props: { movie: Movie }) {
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
                        tempUser.movieList.push(result)
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
                <div className={"name"}>{props.movie.original_title}</div>
                <div className={"release-date"}>{props.movie.release_date}</div>
                <div className={"status-" + props.movie.status}>{props.movie.status}</div>
                <div className={"overview"}>{props.movie.overview}</div>

                <div className={"status-buttons"}>
                    <button className={"delete"}>DELETE???</button>
                    {props.movie.status !== "plan-to-watch" &&
                        <button className={"add-to-watchlist"}
                                tabIndex={3}
                                onClick={() => addMovieToWatchlist(props.movie.id, "plan-to-watch")}>
                            Plan-to-watch
                        </button>
                    }
                    {props.movie.status !== "started" &&
                        <button className={"started"}
                                tabIndex={3}
                                onClick={() => addMovieToWatchlist(props.movie.id, "started")}>
                            Started
                        </button>
                    }
                    {props.movie.status !== "completed" &&
                        <button className={"completed"}
                                tabIndex={3}
                                onClick={() => addMovieToWatchlist(props.movie.id, "completed")}>
                            Completed
                        </button>
                    }
                </div>
            </div>

            <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} className={"poster"}
                 alt={"show-poster"}/>
        </div>
    )
}