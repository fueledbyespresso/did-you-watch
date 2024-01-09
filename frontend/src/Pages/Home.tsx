import React, {useEffect, useState} from "react";
import {TrendingShow} from "../Components/ShowCards/TrendingShowCard";
import {TrendingMovieCard} from "../Components/MovieCards/TrendingMovieCard";

export function Home() {
    const [trending, setTrending] = useState<any>(null)

    useEffect(() => {
        getTrending()
    }, [])

    function getTrending() {
        fetch("https://api.themoviedb.org/3/trending/all/week?api_key="+process.env.REACT_APP_TMDB_KEY, {
            method: "GET",
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    setTrending(result)
                }, (error) => {
                    console.log(error)
                }
            )
    }

    return (
        <div className={"home"}>
            <h1>Trending this week</h1>
            <div className={"trending-films"}>
                {trending !== null && trending.results.map((trendingItem: any) =>
                    <div className={"trending-film-container"} key={trendingItem.id}>
                        {trendingItem.media_type === "movie" && <TrendingMovieCard movie={trendingItem}/>}
                        {trendingItem.media_type === "tv" && <TrendingShow show={trendingItem}/>}
                    </div>
                )}
            </div>
        </div>
    )
}