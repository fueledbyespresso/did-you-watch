import React from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";

export function AccountDropdown() {
    const store = useSelector((state: any) => state.user);

    if (!store.userExists) {
        return (
            <Link to={"/login-signup"} className={"login-signup-button"} tabIndex={4}>
                Login/Signup
            </Link>
        )
    }
    return (
        <Link to={"/account"} className={"account-dropdown"} tabIndex={4}>
            <img src={store.user.profilePicURL || undefined} alt={""}/>
            <div className={"account-name-username"}>
                <div className={"name"}>{store.user.displayName}</div>
                <div className={"username"}>{store.user.username}</div>
            </div>
        </Link>
    )
}