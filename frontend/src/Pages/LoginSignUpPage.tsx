import React from "react";
import {AuthLogin} from "../AuthLogin";
import {Navigate, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";

export function LoginSignUpPage() {
    const user = useSelector((state: any) => state.user)
    let location = useLocation()

    if (user.userExists) {
        return <Navigate to="/account" state={{from: location}} replace/>
    }

    return (
        <div className={"login-signup"}>
            <AuthLogin/>
        </div>
    )
}