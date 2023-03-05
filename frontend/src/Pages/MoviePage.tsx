import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {HeaderBar} from "../Components/HeaderBar/HeaderBar";

export function MoviePage(){
    const {id} = useParams();
    const [show, setShow] = useState<any>(null)
    const [displayAllCast, setDisplayAllCast] = useState<boolean>(false)

    function getShowByID() {
        setDisplayAllCast(false)
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/"+id, {
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

    if (show === null){
        return <div>Loading...</div>
    }

    return(
        <div>
            <HeaderBar/>
            <div className={"full-show-details"}>
                <div className={"show-details"}
                     style={{
                         background: `linear-gradient( rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.65) ),url("https://image.tmdb.org/t/p/original/`+ show.backdrop_path+ `") no-repeat center center`,
                         backgroundSize: "cover"
                     }}>
                    <img src={"https://image.tmdb.org/t/p/w500/" +show.poster_path}
                         className={"poster"}
                         alt={"show-poster"}/>
                    <div className={"text-details"}>
                        <h2>{show.original_title}</h2>
                        <div>{show.release_date}</div>
                        <div className={"overview"}>{show.overview}</div>
                    </div>
                </div>
                
                <h2>Cast</h2>
                <button className={"toggle-full-cast"}
                        onClick={()=>setDisplayAllCast(!displayAllCast)}>
                    Toggle Full Cast
                </button>
                <div className={"credits"}>
                    {show.credits.cast.map((cast: any, i: number) => {
                        if (!displayAllCast && i > 17) {
                            return null
                        }
                        return (
                            <div className={"cast-member"} key={cast.id}>
                                <img src={"https://image.tmdb.org/t/p/w500/" +cast.profile_path} className={"poster"}
                                     alt={"show-poster"}/>
                                <div>{cast.name}</div>
                                <div>{cast.character}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}