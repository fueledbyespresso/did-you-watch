import React from "react";
import {Outlet} from "react-router-dom";
import {HeaderBar} from "../HeaderBar/HeaderBar";
import {useSelector} from "react-redux";
import {RootState, UserState} from "../../Store/userSlice";

export function Root() {
    const user = useSelector<RootState, UserState>((state) => state.user);
    return (
        <div className={user.profile?.darkMode ? "dark" : ""}>
            <HeaderBar/>
            <Outlet/>
        </div>
    )
}