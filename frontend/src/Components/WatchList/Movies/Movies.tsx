import React, {useState} from "react";
import Select from "react-select";
import {useDispatch, useSelector} from "react-redux";
import {Movie} from "../../../Types/Movie";

const options = [
    {value: 'all', label: 'All Movies'},
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
    {value: 'rewatching', label: 'Rewatching'},
    {value: 'dropped', label: 'Dropped'},
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

    return (
        <div className={"films-section"}>
            <h2>Movies</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Movies'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>
            <button onClick={() => setToggleCompact(!toggleCompact)}>
                Compact Mode
            </button>
            <div className={!toggleCompact ? "films" : "films-compact"}>
                {user.movieList != null && !filterReturnsEmpty(filter) ?
                    user.movieList.map((movie: Movie) => {
                        return (
                            (filter === movie.status || filter === "all") &&
                            <Movie key={movie.id}
                                   searchResult={false}
                                   movie={movie}/>
                        )
                    }) : (
                        <div>No movies in this category :(</div>
                    )}
            </div>
        </div>
    )
}