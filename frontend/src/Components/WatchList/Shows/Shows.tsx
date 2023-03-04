import React, {useEffect, useState} from "react";
import Select from "react-select";
import {useDispatch, useSelector} from "react-redux";
import {User} from "../../../Types/User";
import {set} from "../../../Store/userSlice";

const options = [
    {value: 'all', label: 'All Shows'},
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
]

export function Shows() {
    //const {user, setUser} = useContext<any>(UserContext);
    const [filter, setFilter] = useState<string | undefined>("all")

    const userState = useSelector((state: any) => state.user);
    const [user, setUser] = useState<User>(userState.user)
    const dispatch = useDispatch()

    useEffect(() => {
        setUser(userState.user)
    }, [userState]);

    function filterReturnsEmpty(filter: string | undefined) {
        if (filter == "all") {
            return user.tvList.length == 0
        }
        for (let i = 0; i < user.tvList.length; i++) {
            if (user.tvList[i].status == filter) {
                return false
            }
        }
        return true
    }

    function addToWatchList(id: Number, status: string) {
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
                        if (tempUser.tvList[i].ID === result.ID) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUser.tvList[index] = result
                    }

                    dispatch(set(tempUser))
                }, (error) => {

                }
            )
    }

    return (
        <div className={"film-card"}>
            <h2>Your Shows</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Shows'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>

            {user.tvList != null && !filterReturnsEmpty(filter) ?
                Object.keys(user.tvList).map((key) => {
                    return (
                        (filter === user.tvList[parseInt(key)].status || filter === "all") &&
                        <div key={key} className="film">
                            <div>
                                <div className={"name"}>{user.tvList[parseInt(key)].name}</div>
                                <div
                                    className={"status-" + user.tvList[parseInt(key)].status}>{user.tvList[parseInt(key)].status}</div>
                                <div className={"overview"}>{user.tvList[parseInt(key)].overview}</div>

                                <div className={"status-buttons"}>
                                    <button>DELETE???</button>
                                    {user.tvList[parseInt(key)].status !== "plan-to-watch" &&
                                        <button className={"add-to-watchlist"}
                                                onClick={() => addToWatchList(user.tvList[parseInt(key)].ID, "plan-to-watch")}>
                                            Plan-to-watch
                                        </button>
                                    }
                                    {user.tvList[parseInt(key)].status !== "started" &&
                                        <button className={"started"}
                                                onClick={() => addToWatchList(user.tvList[parseInt(key)].ID, "started")}>
                                            Started
                                        </button>
                                    }
                                    {user.tvList[parseInt(key)].status !== "completed" &&
                                        <button className={"completed"}
                                                onClick={() => addToWatchList(user.tvList[parseInt(key)].ID, "completed")}>
                                            Completed
                                        </button>
                                    }
                                </div>
                            </div>
                            <img src={"https://image.tmdb.org/t/p/w500/" + user.tvList[parseInt(key)].posterPath}/>
                        </div>
                    )
                }) : (
                    <div>No shows in this category :(</div>
                )}
        </div>
    )
}