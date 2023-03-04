import React from "react";
import {Search} from "../Search/Search";
import {AccountDropdown} from "../AccountDropdown/AccountDropdown";
import {Link} from "react-router-dom";

export function HeaderBar() {
    return (
        <div className={"header-bar"}>
            <AccountDropdown/>
            <Search/>
            <Link to={"/"}>Did you watch?</Link>
        </div>
    )
}