import {set, UserState} from "../Store/userSlice";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

export type Show = {
    id: number,
    poster_path: string,
    backdrop_path: string,
    status: string,
    overview: string,
    original_name: string,
    first_air_date: string,
    total_episodes: number,
    episodes_watched: number
}

const status_types = [
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
    {value: 'rewatching', label: 'Rewatching'},
    {value: 'dropped', label: 'Dropped'},
]

export function Show(props: { show: Show, searchResult: boolean }) {
    const user = useSelector((state: { user: UserState }) => state.user).user;
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [curShowStatus, setCurShowStatus] = useState<string | null>(null)

    useEffect(() => {
        let matchingShow = user.tvList.filter(obj => {
            return obj.id === props.show.id
        })
        if (matchingShow.length > 0) {
            setCurShowStatus(matchingShow[0].status)
        }
    }, [user]);


    function addShowToWatchlist(id: number, status: string) {
        setLoading(true)
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
                        console.log(result)
                        tempUser.tvList.unshift(result)
                    }
                    setLoading(false)

                    dispatch(set(tempUser))
                }, (error) => {
                    setLoading(false)
                }
            )
    }

    function deleteFromWatchlist(id: number) {
        setLoading(true)

        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id, {
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
                    for (let i = 0; i < tempUser.tvList.length; i++) {
                        if (tempUser.tvList[i].id === id) {
                            tempUser.tvList.splice(i, 1)

                            break;
                        }
                    }
                    setCurShowStatus(null)
                    setLoading(false)
                    dispatch(set(tempUser))
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
                            <Link to={"/show/" + props.show.id}>
                                {props.show.original_name}
                            </Link>
                            <div className={"status"}>{props.show.status}</div>
                        </div>
                        <div>
                            {user.tvList.some(e => e.id === props.show.id) && "In watchlist"}
                        </div>
                        <div className={"release-date"}>{props.show.first_air_date}</div>
                        <div className={"overview"}>{props.show.overview}</div>
                    </div>
                    <img src={(props.show.poster_path === "" || props.show.poster_path === null) ?
                        "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg" :
                        "https://image.tmdb.org/t/p/w500/" + props.show.poster_path}
                         className={"poster"}
                         alt={"show-poster"}/>
                </div>

                <div className={"status-buttons"}>
                    {status_types.map((status) => (
                        <button className={status.value}
                                key={status.value}
                                tabIndex={3}
                                disabled={curShowStatus === status.value}
                                onClick={() => addShowToWatchlist(props.show.id, status.value)}>
                            {status.label}
                        </button>
                    ))}
                    <button onClick={() => deleteFromWatchlist(props.show.id)}
                            className={"delete"}>Remove
                    </button>
                    {loading && <button>Loading...</button>}
                </div>
            </div>
        )
    }

    return (
        <div className={"watchlist-film"}>
            <img src={"https://image.tmdb.org/t/p/w500/" + props.show.poster_path} alt={""}/>
            <div className={"details"}>
                <div className={"text-details"}>
                    <div className={"name"}><Link to={"/show/" + props.show.id}>{props.show.original_name}</Link></div>
                    <div className={"status"}>{props.show.status}</div>
                    <div className={"watch-count"}>{props.show.episodes_watched}/{props.show.total_episodes}
                        <button>Edit</button>
                    </div>
                    {loading && <div>Loading...</div>}
                </div>
                <div className={"status-buttons"}>
                    {status_types.map((status) => (
                        <button className={status.value}
                                key={status.value}
                                tabIndex={3}
                                disabled={curShowStatus === status.value}
                                onClick={() => addShowToWatchlist(props.show.id, status.value)}>
                            {status.label}
                        </button>
                    ))}
                    <button onClick={() => deleteFromWatchlist(props.show.id)}
                            className={"delete"}>Remove
                    </button>
                </div>
            </div>
        </div>
    )
}

export function TrendingShow(props: { show: Show }) {
    return (
        <div className={"trending-film"}>
            <Link to={"/show/" + props.show.id}>
                <img src={"https://image.tmdb.org/t/p/w500/" + props.show.poster_path} className={"poster"}
                     alt={"show-poster"}/>
            </Link>
            <div className={"name"}>{props.show.original_name}</div>
            <div className={"air-date"}>{props.show.first_air_date}</div>
        </div>
    )
}