import React from 'react'
import {useSelector} from "react-redux"
import {Navigate, useLocation} from "react-router-dom"
import {RootState, UserState} from "../Store/userSlice";

const ProtectedRoute = ({children}: any) => {
    const user = useSelector<RootState, UserState>((state) => state.user);
    let location = useLocation();

    if (user.profile === null) {
        return <Navigate to="/" state={{from: location}} replace/>
    }
    return children

};

export default ProtectedRoute;
