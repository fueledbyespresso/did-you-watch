import {Movie} from "./Movie";
import {Show} from "./Show";

export type User = {
    idToken: string
    uid: string
    displayName: string
    profilePicURL: string
    username: string
    movieList: Movie[]
    tvList: Show[]
}

export function User(props: { user: User }) {
    return (
        <div className="result-item-user">
            <img src={props.user.profilePicURL} className={"profile-pic"}
                 alt={"profile-pic"}/>
            <div className={"result-details"}>
                <div className={"result-name"}>{props.user.displayName}</div>
                <div className={"overview"}>{props.user.username}</div>

                <button className={"follow"}
                        tabIndex={3}>
                    Follow
                </button>
            </div>
        </div>
    )
}