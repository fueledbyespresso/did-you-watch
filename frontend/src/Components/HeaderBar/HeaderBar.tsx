import React from "react";
import {Search} from "../Search/Search";
import {AccountDropdown} from "../AccountDropdown/AccountDropdown";
import {Link} from "react-router-dom";

export function HeaderBar() {
    return (
        <div className={"header-bar"}>
            <AccountDropdown/>
            <Search/>
            <div className={"links"}>
                <Link to={"/"}>Did you watch?</Link>
                <Link to={"/my-watchlist"}>My Watchlist</Link>
            </div>
        </div>
    )
}