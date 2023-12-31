import React, {useState} from "react";
import Select from "react-select";
import {useSelector} from "react-redux";
import {Show} from "../../../Types/Show";
import {WatchlistShowCard} from "../../ShowCards/WatchlistShowCard";
import {RootState, UserState} from "../../../Store/userSlice";

const options = [
    {value: 'all', label: 'All Shows'},
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'started', label: 'Started'},
    {value: 'completed', label: 'Completed'},
    {value: 'dropped', label: 'Dropped'},
]

export function Shows() {
    const [filter, setFilter] = useState<string | undefined>("all")
    const user = useSelector<RootState, UserState>((state) => state.user);

    function filterReturnsEmpty(filter: string | undefined) {
        if (user.profile === null){
            return false
        }
        if (filter === "all") {
            return user.profile.tvList.length === 0
        }
        for (let i = 0; i < user.profile.tvList.length; i++) {
            if (user.profile.tvList[i].status === filter) {
                return false
            }
        }
        return true
    }

    if(user.profile === null){
        return <></>
    }

    return (
        <div className={"films-section"}>
            <h2>Shows</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Shows'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>

            <div className={"films"}>
                {user.profile.tvList != null && !filterReturnsEmpty(filter) ?
                    user.profile.tvList.map((show: Show) => {
                        return (
                            (filter === show.status || filter === "all") &&
                                <WatchlistShowCard show={show} key={show.id}/>
                        )
                    }) : (
                        <div>No shows in this category :(</div>
                    )}
            </div>
        </div>
    )
}