import {Link} from "react-router-dom";
import React, {useState} from "react";
import {MovieStatusCard} from "./MovieStatusCard";
import {Movie} from "../../Types/Movie";
import {RootState, set, UserState} from "../../Store/userSlice";
import {useSelector} from "react-redux";

export function WatchlistSMovieCard(props: {
    movie: Movie,
}) {
    const user = useSelector<RootState, UserState>((state) => state.user);
    const [watchHistory, updateLogs] = useState<any>(null)
    const [showHistory, toggleHistory] = useState<boolean>(false)

    function getHistory(id: number) {
        if (user.profile == null){
            return
        }
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/history/" + id, {
            method: "GET",
            headers: {
                'AuthToken': user.profile.idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    updateLogs(result)
                    toggleHistory(true)
                    console.log(result)
                }, (error) => {
                    console.log(error)
                    //TODO Error????
                }
            )
    }
    return (
        <div className={"watchlist-film"}>
            <img src={"https://image.tmdb.org/t/p/w500/" + props.movie.poster_path} alt={""}/>
            <div className={"details"}>
                <div className={"text-details"}>
                    <div className={"name"}>
                        <Link to={"/movie/" + props.movie.id}>{props.movie.original_title}</Link>
                    </div>
                    <div className={"status"}>{props.movie.status}</div>
                </div>
                <MovieStatusCard movieID={props.movie.id}/>
                {!showHistory &&
                    <button onClick={() => getHistory(props.movie.id)}>
                        Get history
                    </button>
                }
                {(watchHistory !== null && showHistory) &&
                    <>
                    {watchHistory.map((status: any) => (
                        <div>{status.status} {(new Date(status.timestamp)).toLocaleString()}</div>
                    ))}
                    <button onClick={()=>toggleHistory(false)}>Hide History</button>
                    </>
                }
            </div>
        </div>
    )
}