import {HeaderBar} from "../Components/HeaderBar/HeaderBar";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

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
        <div>
            <HeaderBar/>
            <Link to={"/my-watchlist"}>My Watchlist</Link>
            {trending != null && trending.results.map((trendingItem: any) =>
                <div>
                    <div key={trendingItem.id}>{trendingItem.media_type}</div>
                </div>
            )}
        </div>
    )
}