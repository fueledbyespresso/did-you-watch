import React from "react";
import {Outlet} from "react-router-dom";
import {HeaderBar} from "../HeaderBar/HeaderBar";
import {useSelector} from "react-redux";
import {UserState} from "../../Store/userSlice";

export function Root() {
    const user = useSelector((state: {user:UserState }) => state.user).user;
    return (
        <div className={user.darkMode ? "dark":""}>
            <HeaderBar/>
            <Outlet />
        </div>
    )
}