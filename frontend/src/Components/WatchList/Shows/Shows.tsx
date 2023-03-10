import React, {useEffect, useState} from "react";
import Select from "react-select";
import {useDispatch, useSelector} from "react-redux";
import {User} from "../../../Types/User";
import {Show} from "../../../Types/Show";

const options = [
    {value: 'all', label: 'All Shows'},
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
    {value: 'rewatching', label: 'Rewatching'},
    {value: 'dropped', label: 'Dropped'},
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

    return (
        <div className={"films-section"}>
            <h2>Shows</h2>
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