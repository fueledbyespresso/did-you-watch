import React, {useState} from "react";
import Select from "react-select";
import {useDispatch, useSelector} from "react-redux";
import {set} from "../../../Store/userSlice";
import {Movie} from "../../../Types/Movie";

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
    const [toggleCompact, setToggleCompact] = useState(false)

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
        <div className={"films-section"}>
            <h2>Your movies</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Movies'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>
            <button onClick={()=>setToggleCompact(!toggleCompact)}>
                Compact Mode
            </button>
            <div className={!toggleCompact ? "films" : "films-compact"}>
                {user.movieList != null && !filterReturnsEmpty(filter) ?
                    user.movieList.map((movie: Movie) => {
                        return (
                            (filter === movie.status || filter === "all") &&
                            <Movie key={movie.id}
                                   compact={toggleCompact}
                                   movie={movie}/>
                        )
                    }) : (
                        <div>No movies in this category :(</div>
                    )}
            </div>
        </div>
    )
}