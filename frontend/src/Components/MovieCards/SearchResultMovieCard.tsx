import {Link} from "react-router-dom";
import React from "react";
import {Movie} from "../../Types/Movie";
import {MovieStatusCard} from "./MovieStatusCard";

export function SearchResultMovieCard(props: {
    movie: Movie,
}) {
    return (
        <div className="film">
            <div className={"film-details"}>
                <div className={"text-details"}>
                    <div className={"name"}>
                        <Link to={"/show/" + props.movie.id}>
                            {props.movie.original_title}
                        </Link>
                        <div className={"status"}>{props.movie.status}</div>
                    </div>

                    <div className={"release-date"}>{props.movie.release_date}</div>
                    <div className={"overview"}>{props.movie.overview}</div>
                </div>
                <img src={(props.movie.poster_path === "" || props.movie.poster_path === null) ?
                    "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg" :
                    "https://image.tmdb.org/t/p/w500/" + props.movie.poster_path}
                     className={"poster"}
                     alt={"show-poster"}/>
            </div>

            <MovieStatusCard movieID={props.movie.id}/>
        </div>
    )
}