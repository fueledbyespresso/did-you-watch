import {Show} from "../../Types/Show";
import {Link} from "react-router-dom";
import React from "react";
import {ShowStatusButtons} from "./ShowStatusButtons";

export function SearchResultShowCard(props: {
    show: Show,
}) {
    return (
        <div className="film">
            <div className={"film-details"}>
                <div className={"text-details"}>
                    <div className={"name"}>
                        <Link to={"/show/" + props.show.id}>
                            {props.show.original_name}
                        </Link>
                        <div className={"status"}>{props.show.status}</div>
                    </div>

                    <div className={"release-date"}>{props.show.first_air_date}</div>
                    <div className={"overview"}>{props.show.overview}</div>
                </div>
                <img src={(props.show.poster_path === "" || props.show.poster_path === null) ?
                    "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg" :
                    "https://image.tmdb.org/t/p/w500/" + props.show.poster_path}
                     className={"poster"}
                     alt={"show-poster"}/>
            </div>

            <ShowStatusButtons showID={props.show.id}/>
        </div>
    )
}