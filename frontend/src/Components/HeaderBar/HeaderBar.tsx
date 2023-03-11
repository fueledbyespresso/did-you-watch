import React from "react";
import {Search} from "../Search/Search";
import {AccountDropdown} from "../AccountDropdown/AccountDropdown";
import {Link, NavLink} from "react-router-dom";
import {useSelector} from "react-redux";

export function HeaderBar() {
    const store = useSelector((state: any) => state.user);

    return (
        <div className={"header-bar"}>
            <AccountDropdown/>
            <Search/>
            <div className={"links"}>
                <Link className={"logo"} to={"/"}>Did you watch?</Link>
                {store.userExists &&
                    <>
                        <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={"/my-movies"}>My
                            Movies</NavLink>
                        <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={"/my-shows"}>My
                            Shows</NavLink>
                        <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')}
                                 to={"/account"}>Account</NavLink>
                    </>
                }
            </div>
        </div>
    )
}