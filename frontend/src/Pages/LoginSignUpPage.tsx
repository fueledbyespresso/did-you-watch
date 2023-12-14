import React from "react";
import {AuthLogin} from "../AuthLogin";
import {Navigate, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState, UserState} from "../Store/userSlice";

export function LoginSignUpPage() {
    const user = useSelector<RootState, UserState>((state) => state.user);
    let location = useLocation()

    if (user === null) {
        return (
            <div className={"login-signup"}>
                <AuthLogin/>
            </div>
        )
    }

    return <Navigate to="/account" state={{from: location}} replace/>
}