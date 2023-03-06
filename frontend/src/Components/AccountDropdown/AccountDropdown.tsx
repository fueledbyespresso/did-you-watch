import React from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import firebase from "firebase/compat/app";
import {AuthGoogle} from "../../AuthGoogle";

export function AccountDropdown() {
    const store = useSelector((state: any) => state.user);
    function signOut() {
        console.log("signing out")
        firebase.auth().signOut().then(r => console.log("signed out"))
    }

    if(!store.userExists){
        return (
            <div className={"account-dropdown"} tabIndex={4}>
                Login/Signup
                <div className={"login"}>
                    <AuthGoogle/>
                </div>
            </div>
        )
    }
    return (
        <div className={"account-dropdown"} tabIndex={4}>
            <img src={store.user.profilePicURL || undefined} alt={""}/>
            <div className={"account-name-username"}>
                <div className={"name"}>{store.user.displayName}</div>
                <div className={"username"}>{store.user.username}</div>
            </div>

            <div className={"account-options"}>
                <button className={"sign-out"} onClick={() => signOut()}>Sign out</button>
            </div>
        </div>
    )
}