import {HeaderBar} from "../Components/HeaderBar/HeaderBar";
import {useSelector} from "react-redux";
import {UserState} from "../Store/userSlice";

export function Account(){
    const user = useSelector((state: {user:UserState }) => state.user).user;

    return(
        <div className={"account-page"}>
            <HeaderBar/>
            <h1>Account</h1>
            <div>Display Name: {user.displayName}</div>
            <div>Username: {user.username}</div>
            <div>Profile Picture: {user.profilePicURL}</div>
        </div>
    )
}