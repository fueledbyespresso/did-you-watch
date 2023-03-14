import {Link, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {ShowStatusButtons} from "../Components/ShowCards/ShowStatusButtons";

export function TVShowPage() {
    const {id} = useParams()
    const [show, setShow] = useState<any>(null)
    const [displayAllCast, setDisplayAllCast] = useState<boolean>(false)

    function getShowByID() {
        setDisplayAllCast(false)
        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id, {
            method: "GET",
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    setShow(result)
                }, (error) => {

                }
            )
    }

    useEffect(() => {
        getShowByID()
    }, [id])

    if (show === null) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div className={"full-show-details"}>
                <div className={"show-details"}
                     style={{
                         background: `linear-gradient( rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.65) ),url("https://image.tmdb.org/t/p/original/` + show.backdrop_path + `") no-repeat center top fixed`,
                         backgroundSize: "cover"
                     }}>

                    <img src={show.poster_path !== null ?
                        "https://image.tmdb.org/t/p/w500/" + show.poster_path :
                        "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg"}
                         className={"poster"}
                         alt={"show-poster"}/>
                    <div className={"text-details"}>
                        <h2>{show.original_name}</h2>
                        <div>{show.first_air_date}</div>
                        <div className={"overview"}>{show.overview}</div>
                        <ShowStatusButtons showID={show.id}/>
                    </div>
                </div>
                <h2>Cast
                    <button className={"toggle-full-cast"}
                            onClick={() => setDisplayAllCast(!displayAllCast)}>
                        Toggle Full Cast
                    </button>
                </h2>
                <div className={"credits"}>
                    {show.aggregate_credits.cast.map((cast: any, i: number) => {
                        if (!displayAllCast && i > 17) {
                            return null
                        }
                        return (
                            <div className={"cast-member"} key={cast.id}>
                                <Link to={"/actor/" + cast.id}>
                                    <img src={cast.profile_path !== null ?
                                        "https://image.tmdb.org/t/p/w500/" + cast.profile_path :
                                        "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg"}
                                         className={"poster"}
                                         alt={"show-poster"}/>
                                </Link>
                                <div className={"name"}>
                                    <b>{cast.name}</b> playing {cast.roles.length > 0 ? cast.roles[0].character : "Unknown"}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <h2>Seasons</h2>
                <div className={"seasons"}>
                    {show.seasons.map((season: any) => {
                        return (
                            <div className={"season"} key={season.name}>
                                <img src={"https://image.tmdb.org/t/p/w500/" + season.poster_path} className={"poster"}
                                     alt={"show-poster"}/>
                                <div>{season.name}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}