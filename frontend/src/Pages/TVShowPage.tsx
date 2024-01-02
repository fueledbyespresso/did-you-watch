import {Link, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {ShowStatusButtons} from "../Components/ShowCards/ShowStatusButtons";

export function TVShowPage() {
    type season = {
        loading: boolean;
        name: string;
        episodes: any;
    }
    const {id} = useParams()
    const [show, setShow] = useState<any>(null)
    const [selectedSeason, setSelectedSeason] = useState<any>(null)
    const [seasons, setSelectedSeasons] = useState<Map<number, season>>(new Map<number, season>())

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
                    let mapOfSeasons = new Map<number, season>();
                    result.seasons.forEach((curSeason:any) => {
                        let tempSeason: season = {
                            loading: true,
                            name: curSeason.name,
                            episodes: null
                        }
                        mapOfSeasons.set(curSeason.season_number, tempSeason)
                    })

                    console.log(mapOfSeasons)
                    setSelectedSeasons(mapOfSeasons)
                    setShow(result)
                }, (error) => {

                }
            )
    }

    function getSeasonByID(seasonID: any) {
        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id +"/season/" + seasonID, {
            method: "GET",
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    let mapOfSeasons = seasons
                    mapOfSeasons.set(seasonID, {
                        loading: false,
                        name:result.name,
                        episodes: result.episodes
                    })
                    console.log(mapOfSeasons)
                    setSelectedSeasons(mapOfSeasons)
                    setSelectedSeason(seasonID)
                }, (error) => {

                }
            )
    }

    function selectSeason(seasonID: any){
        console.log(seasonID)
        if(seasons.get(seasonID)?.loading ){
            getSeasonByID(seasonID)
        }else{
            setSelectedSeason(seasonID)
        }
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
                <section className={"next-episode-to-air"}>
                    {show.next_episode_to_air !== null &&
                        <div>
                            <h2>Next episode airs on {(new Date(show.next_episode_to_air.air_date)).toDateString()}</h2>
                            <img src={show.next_episode_to_air.still_path !== null ?
                                "https://image.tmdb.org/t/p/w500/" + show.next_episode_to_air.still_path :
                                "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg"}/>
                            <div>Episode {show.next_episode_to_air.episode_number}: {show.next_episode_to_air.name}</div>
                            <div>{show.next_episode_to_air.overview}</div>
                        </div>
                    }
                </section>
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
                            <div className={"season"}
                                 key={season.name}
                                 onClick={()=>selectSeason(season.season_number)}>
                                <img src={"https://image.tmdb.org/t/p/w500/" + season.poster_path} className={"poster"}
                                     alt={"show-poster"}/>
                                <div>{season.name}</div>
                            </div>
                        )
                    })}
                </div>
                <div className={"season-selector"}>
                    {[...seasons.keys()].map((seasonNumber: any) =>
                        <button onClick={()=>selectSeason(seasonNumber)} key={seasonNumber}>
                            {seasons?.get(seasonNumber)?.name}
                        </button>
                    )}
                </div>
                <div className={"selected-season"}>
                    {seasons?.get(selectedSeason)?.loading ? "loading":
                        <div>
                            {seasons?.get(selectedSeason)?.episodes.map((episode:any) => {
                                return (
                                    <div className={"season"} key={episode.id}>
                                        <img src={episode.still_path !== null ?
                                            "https://image.tmdb.org/t/p/w300/" + episode.still_path :
                                            "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg"}/>
                                        <div className={"info"}>
                                            <b>{episode.name}</b>
                                            <div>{episode.overview}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}