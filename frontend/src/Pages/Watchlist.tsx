import {HeaderBar} from "../Components/HeaderBar/HeaderBar";
import {Movies} from "../Components/WatchList/Movies/Movies";
import {Shows} from "../Components/WatchList/Shows/Shows";
import React from "react";
import {Show} from "../Types/Show";


export function Watchlist(props: {category: string}){
    return(
        <div className={"watchlist"}>
            <HeaderBar/>
            {props.category === "movies" && <Movies/>}
            {props.category === "shows" && <Shows/>}
        </div>
    )
}