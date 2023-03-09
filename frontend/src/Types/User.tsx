import {Movie} from "./Movie";
import {Show} from "./Show";
import {Link} from "react-router-dom";

export type User = {
    idToken: string
    uid: string
    displayName: string
    profilePicURL: string
    username: string
    darkMode: boolean
    movieList: Movie[]
    tvList: Show[]
}

export function User(props: { user: User }) {
    return (
        <div className="result-item-user">
            <img src={props.user.profilePicURL} className={"profile-pic"}
                 alt={"profile-pic"}/>
            <div className={"result-details"}>
                <div className={"result-name"}><Link to={"/user/"+props.user.uid}><b>{props.user.displayName}</b></Link></div>
                <div className={"overview"}>{props.user.username}</div>

                <button className={"follow"}
                        tabIndex={3}>
                    Follow
                </button>
            </div>
        </div>
    )
}