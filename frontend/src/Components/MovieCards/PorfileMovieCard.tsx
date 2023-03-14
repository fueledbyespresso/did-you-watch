import {Link} from "react-router-dom";
import React from "react";
import {MovieStatusCard} from "./MovieStatusCard";
import {Movie} from "../../Types/Movie";

export function ProfileMovieCard(props: {
    movie: Movie
}) {
    return (
        <div className={"watchlist-film"}>
            <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} alt={""}/>
            <div className={"details"}>
                <div className={"text-details"}>
                    <div className={"name"}><Link to={"/show/" + props.movie.id}>{props.movie.original_title}</Link></div>
                    <div className={"status"}>{props.movie.status}</div>
                </div>
                <MovieStatusCard movieID={props.movie.id}/>
            </div>
        </div>
    )
}