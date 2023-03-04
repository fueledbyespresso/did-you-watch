import {HeaderBar} from "../Components/HeaderBar/HeaderBar";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";


export function UserProfile(){
    const { id } = useParams();
    const [curUser, setCurUser] = useState<any>("")

    useEffect(() => {
        setCurUser(id)
    }, [])
    return(
        <div className={"user-profile"}>
            <HeaderBar/>
            <div>User profile of: {curUser} </div>
        </div>
    )
}