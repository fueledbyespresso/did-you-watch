import {HeaderBar} from "../Components/HeaderBar/HeaderBar";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Movie, TrendingMovie} from "../Types/Movie";
import {Show, TrendingShow} from "../Types/Show";

export function Home(){
    const [trending, setTrending] = useState<any>(null)

    useEffect(() => {
        getTrending()
    }, [])

    function getTrending() {
        fetch(process.env.REACT_APP_HOST + "/api/v1/trending", {
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

    return(
        <div className={"home"}>
            <h1>Trending this week</h1>
            <div className={"trending-films"}>
                {trending !== null &&  trending.results.map((trendingItem: any) =>
                    <div className={"trending-film-container"} key={trendingItem.id}>
                        {trendingItem.media_type === "movie" && <TrendingMovie movie={trendingItem}/>}
                        {trendingItem.media_type === "tv" && <TrendingShow show={trendingItem}/>}
                    </div>
                )}
            </div>
        </div>
    )
}