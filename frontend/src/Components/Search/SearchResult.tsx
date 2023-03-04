export function SearchResult(props: any) {
    //const {user, setUser} = useContext<{user: User, setUser: (tempUser: User) => {}}>(UserContext);

    function addToWatchList(id: any, planToWatch: string, category: any) {
        props.addToWatchlist(id, planToWatch, category)
    }

    return (
        <div className="result-item">
            <div className={"result-details"}>
                <div className={"result-name"}>{props.result.original_title || props.result.original_name}</div>
                <div className={"release_date"}>{props.result.release_date || props.result.first_air_date}</div>
                <div className={"overview"}>{props.result.overview}</div>

                <div className={"status-buttons"}>
                    <button className={"add-to-watchlist"}
                            tabIndex={3}
                            onClick={() => addToWatchList(props.result.id, "plan-to-watch", props.category)}>
                        Plan-to-watch
                    </button>
                    <button className={"started"}
                            tabIndex={3}
                            onClick={() => addToWatchList(props.result.id, "started", props.category)}>
                        Started
                    </button>
                    <button className={"completed"}
                            tabIndex={3}
                            onClick={() => addToWatchList(props.result.id, "completed", props.category)}>
                        Completed
                    </button>
                </div>
            </div>

            <img src={"https://image.tmdb.org/t/p/w500/" + props.result.poster_path} className={"poster"}
                 alt={"movie-poster"}/>
        </div>
    )
}