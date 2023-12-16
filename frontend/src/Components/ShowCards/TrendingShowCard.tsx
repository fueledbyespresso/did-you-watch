import {Show} from "../../Types/Show";
import {Link} from "react-router-dom";
import React from "react";
import {shallowEqual} from "react-redux";

export function TrendingShow(props: { show: Show }) {
    let date = new Date(props.show.first_air_date)
    return (
        <div className={"trending-film"}>
            <Link to={"/show/" + props.show.id}>
                <img src={"https://image.tmdb.org/t/p/w500/" + props.show.poster_path} className={"poster"}
                     alt={"show-poster"}/>
            </Link>
            <div className={"name"}>{props.show.original_name}</div>
            <div className={"air-date"}>{date.toDateString()}</div>
        </div>
    )
}