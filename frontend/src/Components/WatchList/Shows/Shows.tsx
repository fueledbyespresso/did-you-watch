import React, {useEffect, useState} from "react";
import Select from "react-select";
import {useDispatch, useSelector} from "react-redux";
import {User} from "../../../Types/User";
import {set} from "../../../Store/userSlice";
import {Show} from "../../../Types/Show";

const options = [
    {value: 'all', label: 'All Shows'},
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
]

export function Shows() {
    const [filter, setFilter] = useState<string | undefined>("all")

    const userState = useSelector((state: any) => state.user);
    const [user, setUser] = useState<User>(userState.user)
    const dispatch = useDispatch()
    const [toggleCompact, setToggleCompact] = useState(false)

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

    function addToWatchList(id: number, status: string) {
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
                    }

                    dispatch(set(tempUser))
                }, (error) => {

                }
            )
    }

    return (
        <div className={"films-section"}>
            <h2>Your Shows</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Shows'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>
            <button onClick={()=>setToggleCompact(!toggleCompact)}>
                Compact Mode
            </button>
            <div className={!toggleCompact ? "films" : "films-compact"}>
                {user.tvList != null && !filterReturnsEmpty(filter) ?
                    user.tvList.map((show: Show) => {
                        return (
                            (filter === show.status || filter === "all") &&
                            <Show key={show.id}
                                  compact={toggleCompact}
                                  show={show}/>
                        )
                    }) : (
                        <div>No shows in this category :(</div>
                    )}
            </div>
        </div>
    )
}