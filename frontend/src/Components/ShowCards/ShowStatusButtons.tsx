import {useDispatch, useSelector} from "react-redux";
import {set, UserState} from "../../Store/userSlice";
import React, {useEffect, useState} from "react";

const status_types = [
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
    {value: 'rewatching', label: 'Rewatching'},
    {value: 'dropped', label: 'Dropped'},
]

export function ShowStatusButtons(props: { showID: number }) {
    const user = useSelector((state: { user: UserState }) => state.user).user;
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [newEpisodesWatched, setNewEpisodesWatched] = useState<number>(0)

    const [showStatus, setShowStatus] = useState<string | null>(null)
    const [episodesWatched, setEpisodesWatched] = useState<number>(0)
    const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null)

    useEffect(() => {
        let matchingShow = user.tvList.filter(obj => {
            return obj.id === props.showID
        })
        if (matchingShow.length > 0) {
            setShowStatus(matchingShow[0].status)
            setEpisodesWatched(matchingShow[0].episodes_watched)
            setNewEpisodesWatched(matchingShow[0].episodes_watched)
            setTotalEpisodes(matchingShow[0].total_episodes)
        }
    }, [user]);


    function addShowToWatchlist(id: number, status: string, episodesWatched: number) {
        setLoading(true)
        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id + "/" + status+"/"+episodesWatched, {
            method: "PUT",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    let index = -1;
                    for (let i = 0; i < tempUser.tvList.length; i++) {
                        if (tempUser.tvList[i].id === result.id) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUser.tvList[index] = result
                    } else {
                        console.log(result)
                        tempUser.tvList.unshift(result)
                    }
                    setLoading(false)

                    dispatch(set(tempUser))
                }, (error) => {
                    setLoading(false)
                }
            )
    }

    function deleteFromWatchlist(id: number) {
        setLoading(true)

        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id, {
            method: "DELETE",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    for (let i = 0; i < tempUser.tvList.length; i++) {
                        if (tempUser.tvList[i].id === id) {
                            tempUser.tvList.splice(i, 1)

                            break;
                        }
                    }
                    setShowStatus(null)
                    setLoading(false)
                    dispatch(set(tempUser))
                }, (error) => {

                }
            )
    }

    return (
        <div className={"status-buttons"}>
            <div className={"watch-count"}>
                {editMode ? (
                    <>
                        Episodes watched: <input value={newEpisodesWatched} onChange={(e) => {
                            if(!isNaN(+e.target.value) && Number(e.target.value) <= (totalEpisodes || 0)){
                                setNewEpisodesWatched(Number(e.target.value))
                            }
                        }
                    }/>/{totalEpisodes}
                        <button onClick={()=>{
                            addShowToWatchlist(props.showID, showStatus || "plan-to-watch", newEpisodesWatched)
                            setEditMode(false)
                        }
                        }>Submit</button>
                        <button onClick={()=>setEditMode(false)}>Cancel Edit</button>
                    </>
                ) : (
                    <>
                        Episodes watched: {episodesWatched}/{totalEpisodes}
                        <button onClick={()=>setEditMode(true)}>Edit</button>
                    </>
                )}

            </div>
            {loading && <div>"Loading..."</div>}
            {status_types.map((status) => (
                <button className={status.value}
                        key={status.value}
                        tabIndex={3}
                        disabled={showStatus === status.value}
                        onClick={() => addShowToWatchlist(props.showID, status.value, episodesWatched)}>
                    {status.label}
                </button>
            ))}
            <button onClick={() => deleteFromWatchlist(props.showID)}
                    className={"delete"}>Remove
            </button>
        </div>
    )
}

