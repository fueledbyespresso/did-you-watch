import {set, UserState} from "../Store/userSlice";
import {useDispatch, useSelector} from "react-redux";
import {User} from "./User";
import React from "react";
import {Link} from "react-router-dom";

export type Show = {
    id: number,
    poster_path: string,
    status: string,
    overview: string,
    original_name: string,
    first_air_date: string
}

export function Show(props: { show: Show }) {
    const user = useSelector((state: {user:UserState }) => state.user).user;
    const dispatch = useDispatch()

    function addShowToWatchlist(id: number, status: string) {
        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id + "/" + status, {
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
                    for (let i = 0; i < tempUser.tvList.length; i++) {
                        if (tempUser.tvList[i].id === result.id) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUser.tvList[index] = result
                    } else {
                        tempUser.tvList.push(result)
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
                <div className={"name"}><Link to={"/show/"+props.show.id}>{props.show.original_name}</Link></div>
                <div className={"release-date"}>{props.show.first_air_date}</div>
                <div className={"status-" + props.show.status}>{props.show.status}</div>
                <div className={"overview"}>{props.show.overview}</div>

                <div className={"status-buttons"}>
                    <button className={"delete"}>DELETE???</button>
                    {props.show.status !== "plan-to-watch" &&
                        <button className={"add-to-watchlist"}
                                tabIndex={3}
                                onClick={() => addShowToWatchlist(props.show.id, "plan-to-watch")}>
                            Plan-to-watch
                        </button>
                    }
                    {props.show.status !== "started" &&
                        <button className={"started"}
                                tabIndex={3}
                                onClick={() => addShowToWatchlist(props.show.id, "started")}>
                            Started
                        </button>
                    }
                    {props.show.status !== "completed" &&
                        <button className={"completed"}
                                tabIndex={3}
                                onClick={() => addShowToWatchlist(props.show.id, "completed")}>
                            Completed
                        </button>
                    }
                </div>
            </div>

            <img src={"https://image.tmdb.org/t/p/w500/" + props.show.poster_path} className={"poster"}
                 alt={"show-poster"}/>
        </div>
    )
}

export function TrendingShow(props: {show: Show}) {
    return (
        <div className={"trending-film"}>
            <Link to={"/show/"+props.show.id}>
                <img src={"https://image.tmdb.org/t/p/w500/" + props.show.poster_path} className={"poster"}
                     alt={"show-poster"}/>
            </Link>
            <div className={"name"}>{props.show.original_name}</div>
            <div className={"air-date"}>{props.show.first_air_date}</div>
        </div>
    )
}