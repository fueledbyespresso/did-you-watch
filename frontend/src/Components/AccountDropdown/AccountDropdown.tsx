import React from "react";
import {useSelector} from "react-redux";

export function AccountDropdown(props: { signOut: any }) {
    const store = useSelector((state: any) => state.user);

    if (store.userExists === false) {
        return <div></div>
    }

    return (
        <div className={"account-dropdown"}>
            <img src={store.user.profilePicURL || undefined} alt={""}/>
            <div>
                <div className={"name"}>{store.user.displayName}</div>
                <div className={"username"}>{store.user.username}</div>
            </div>

            <div className={"account-options"}>
                <button className={"sign-out"} onClick={() => props.signOut()}>Sign out</button>
            </div>
        </div>
    )
}