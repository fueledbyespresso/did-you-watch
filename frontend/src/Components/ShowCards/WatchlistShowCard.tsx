import {Show} from "../../Types/Show";
import {Link} from "react-router-dom";
import React from "react";
import {ShowStatusButtons} from "./ShowStatusButtons";

export function WatchlistShowCard(props: {
    show: Show,
}) {
    return (
        <div className={"watchlist-film"}>
            <img src={"https://image.tmdb.org/t/p/w500/" + props.show.poster_path} alt={""}/>
            <div className={"details"}>
                <div className={"text-details"}>
                    <div className={"name"}>
                        <Link to={"/show/" + props.show.id}>{props.show.original_name}</Link>
                    </div>
                    <div className={"status"}>{props.show.status}</div>
                </div>
                <ShowStatusButtons showID={props.show.id}/>
            </div>
        </div>
    )
}