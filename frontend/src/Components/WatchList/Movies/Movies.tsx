import React, {useState} from "react";
import Select from "react-select";
import {useDispatch, useSelector} from "react-redux";
import {set} from "../../../Store/userSlice";

const options = [
    {value: 'all', label: 'All Movies'},
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
]

export function Movies() {
    const [filter, setFilter] = useState<string | undefined>("all")
    const user = useSelector((state: any) => state.user).user;
    const dispatch = useDispatch()

    function filterReturnsEmpty(filter: string | undefined) {
        if (filter == "all") {
            return user.movieList.length == 0
        }
        for (let i = 0; i < user.movieList.length; i++) {
            if (user.movieList[i].status == filter) {
                return false
            }
        }
        return true
    }

    function addToWatchList(id: Number, status: string) {
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
                        if (tempUser.movieList[i].ID === result.ID) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUser.movieList[index] = result
                    }

                    dispatch(set(tempUser))
                }, (error) => {

                }
            )
    }

    return (
        <div className={"film-card"}>
            <h2>Your movies</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Movies'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>

            {user.movieList != null && !filterReturnsEmpty(filter) ?
                Object.keys(user.movieList).map((key) => {
                    return (
                        (filter === user.movieList[key as any].status || filter === "all") &&
                        <div key={key} className="film">
                            <div className={"movie-details"}>
                                <div className={"name"}>{user.movieList[parseInt(key)].name}</div>
                                <div
                                    className={"status-" + user.movieList[key as any].status}>{user.movieList[parseInt(key)].status}</div>
                                <div className={"overview"}>{user.movieList[parseInt(key)].overview}</div>

                                <div className={"status-buttons"}>
                                    <button>DELETE???</button>
                                    {user.movieList[parseInt(key)].status !== "plan-to-watch" &&
                                        <button className={"add-to-watchlist"}
                                                onClick={() => addToWatchList(user.movieList[parseInt(key)].ID, "plan-to-watch")}>
                                            Plan-to-watch
                                        </button>
                                    }
                                    {user.movieList[key as any].status !== "started" &&
                                        <button className={"started"}
                                                onClick={() => addToWatchList(user.movieList[parseInt(key)].ID, "started")}>
                                            Started
                                        </button>
                                    }
                                    {user.movieList[parseInt(key)].status !== "completed" &&
                                        <button className={"completed"}
                                                onClick={() => addToWatchList(user.movieList[parseInt(key)].ID, "completed")}>
                                            Completed
                                        </button>
                                    }
                                </div>
                            </div>
                            <img src={"https://image.tmdb.org/t/p/w500/" + user.movieList[parseInt(key)].posterPath}/>
                        </div>
                    )
                }) : (
                    <div>No movies in this category :(</div>
                )}
        </div>
    )
}