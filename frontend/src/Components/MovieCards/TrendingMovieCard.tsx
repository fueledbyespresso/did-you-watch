import {Link} from "react-router-dom";
import React from "react";
import {Movie} from "../../Types/Movie";

export function TrendingMovieCard(props: { movie: Movie }) {
    let date = new Date(props.movie.release_date)

    return (
        <div className={"trending-film"}>
            <Link to={"/movie/" + props.movie.id}>
                <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} className={"poster"}
                     alt={"show-poster"}/>
            </Link>
            <div className={"name"}>{props.movie.original_title}</div>
            <div className={"air-date"}>{date.toDateString()}</div>
        </div>
    )
}