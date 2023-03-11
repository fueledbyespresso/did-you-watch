import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {User} from "../Types/User";
import {Show} from "../Types/Show";
import {Movie} from "../Types/Movie";

export function UserPage() {
    const [user, setUser] = useState<User | null>(null)
    const {id} = useParams()
    const [tab, setTab] = useState("shows")

    useEffect(() => {
        getUser()
    }, [id])

    function getUser() {
        fetch(process.env.REACT_APP_HOST + "/api/v1/user/" + id, {
            method: "GET",
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    setUser(result)
                }, (error) => {
                    console.log(error)
                }
            )
    }

    if (user === null) {
        return (<div>No current user :(</div>)
    }

    return (
        <div className={"user-page"}>
            <div className={"banner"}
                 style={{
                     backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.65) ),url("` + user.profilePicURL + `")`,
                     backgroundRepeat: "no-repeat",
                     backgroundPosition: "center",
                     backgroundSize: "cover"
                 }}>
                <img src={user.profilePicURL} alt={""}/>
                <h1>{user.username}</h1>
            </div>

            <div>
                <button onClick={() => setTab("shows")}>Shows</button>
                <button onClick={() => setTab("movies")}>Movies</button>
            </div>

            <div className={"films"}>
                {tab === "shows" && user.tvList.map(show => (
                    <Show show={show} key={show.id} searchResult={false}/>
                ))}
                {tab === "movies" && user.movieList.map(movie => (
                    <Movie movie={movie} key={movie.id}/>
                ))}
            </div>
        </div>
    )
}