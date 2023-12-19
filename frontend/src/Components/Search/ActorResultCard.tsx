import {Link} from "react-router-dom";

export function ActorResultCard(props: {actor: any, actorID: number }) {
    return (
        <div className={"actor"}>
            <div>
                <Link to={"/actor/" + props.actorID} onClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                }}>
                    {props.actor.name}
                </Link>
                <div>Known for {props.actor.known_for_department}</div>
            </div>

            <img src={props.actor.profile_path !== null ?
                "https://image.tmdb.org/t/p/w300/" + props.actor.profile_path :
                "https://did-you-watch-avatars.s3.us-west-2.amazonaws.com/placeholder.jpg"}
                 className={"poster"}
                 alt={"actor-headshot"}/>
        </div>
    )
}

