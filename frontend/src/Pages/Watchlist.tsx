import {HeaderBar} from "../Components/HeaderBar/HeaderBar";
import {Movies} from "../Components/WatchList/Movies/Movies";
import {Shows} from "../Components/WatchList/Shows/Shows";
import React from "react";

export function Watchlist(){
    return(
        <div className={"watchlist"}>
            <HeaderBar/>
            <Movies/>
            <Shows/>
        </div>
    )
}