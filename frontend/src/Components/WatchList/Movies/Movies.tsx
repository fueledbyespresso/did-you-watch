import React, {useState} from "react";
import Select from "react-select";
import {useSelector} from "react-redux";
import {Movie} from "../../../Types/Movie";
import {WatchlistSMovieCard} from "../../MovieCards/WatchlistSMovieCard";
import {RootState, UserState} from "../../../Store/userSlice";

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
    const user = useSelector<RootState, UserState>((state) => state.user);

    function filterReturnsEmpty(filter: string | undefined) {
        if (user.profile === null){
            return true
        }
        if (filter == "all") {
            return user.profile.movieList.length == 0
        }
        for (let i = 0; i < user.profile.movieList.length; i++) {
            if (user.profile.movieList[i].status == filter) {
                return false
            }
        }
        return true
    }

    if (user.profile === null){
        return <></>
    }

    return (
        <div className={"films-section"}>
            <h2>Movies</h2>
            <Select options={options}
                    defaultValue={{value: 'all', label: 'All Movies'}}
                    onChange={(values) => setFilter(values?.value)}
                    className="filter-select"/>

            <div className={"films"}>
                {user.profile.movieList != null && !filterReturnsEmpty(filter) ?
                    user.profile.movieList.map((movie: Movie) => {
                        return (
                            (filter === movie.status || filter === "all") &&
                                <WatchlistSMovieCard movie={movie} key={movie.id}/>
                        )
                    }) : (
                        <div>No movies in this category :(</div>
                    )}
            </div>
        </div>
    )
}