import React from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {RootState, UserState} from "../../Store/userSlice";

export function AccountDropdown() {
    const user = useSelector<RootState, UserState>((state) => state.user);
    if (user.profile === null) {
        return (
            <>
                <Link to={"/signup"} className={"signup-button"} tabIndex={4}>
                    Sign up
                </Link>
                <Link to={"/login"} className={"login-button"} tabIndex={4}>
                    Login
                </Link>
            </>
        )
    }
    return (
        <Link to={"/account"} className={"account-dropdown"} tabIndex={4}>
            <img src={user.profile.profilePicURL || undefined} alt={""}/>
            <div className={"account-name-username"}>
                <div className={"name"}>{user.profile.displayName}</div>
                <div className={"username"}>{user.profile.username}</div>
            </div>
        </Link>
    )
}