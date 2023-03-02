import React from "react";
import {User} from "../../interfaces/User";
import {Search} from "../Search/Search";
import {AccountDropdown} from "../AccountDropdown/AccountDropdown";

export function HeaderBar(props: { user: User, signOut: any, idToken: string }) {
    return (
        <div className={"header-bar"}>
            <AccountDropdown signOut={props.signOut}/>
            <Search/>
        </div>
    )
}