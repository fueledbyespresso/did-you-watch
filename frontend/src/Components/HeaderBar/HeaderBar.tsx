import React from "react";
import {Search} from "../Search/Search";
import {AccountDropdown} from "../AccountDropdown/AccountDropdown";
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState, UserState} from "../../Store/userSlice";

export function HeaderBar() {
    const user = useSelector<RootState, UserState>((state) => state.user);

    return (
        <div className={"header-bar"}>
            <AccountDropdown/>
            <Search/>
            <div className={"links"}>
                <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={"/"}>Trending</NavLink>
                {user !== null &&
                    <>
                        <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={"/my-movies"}>My
                            Movies
                        </NavLink>
                        <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={"/my-shows"}>My
                            Shows
                        </NavLink>
                    </>
                }
            </div>
        </div>
    )
}