import {useDispatch, useSelector} from "react-redux";
import {RootState, set, UserState} from "../../Store/userSlice";
import React, {useEffect, useState} from "react";
import {Show} from "../../Types/Show";

const status_types = [
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'completed', label: 'Completed'},
    {value: 'started', label: 'Started'},
    {value: 'rewatching', label: 'Rewatching'},
    {value: 'dropped', label: 'Dropped'},
]

export function ShowStatusButtons(props: { showID: number }) {
    const user = useSelector<RootState, UserState>((state) => state.user);
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [newEpisodesWatched, setNewEpisodesWatched] = useState<number>(0)

    const [showStatus, setShowStatus] = useState<string | null>(null)
    const [episodesWatched, setEpisodesWatched] = useState<number>(0)
    const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null)

    useEffect(() => {
        if (user.profile == null){
            return
        }
        let matchingShow = user.profile.tvList.find(curShow => {
            return curShow.id === props.showID
        })
        if (matchingShow === undefined){
            return
        }
        setShowStatus(matchingShow.status)
        setEpisodesWatched(matchingShow.episodes_watched)
        setNewEpisodesWatched(matchingShow.episodes_watched)
        setTotalEpisodes(matchingShow.total_episodes)
    }, [user]);


    function addShowToWatchlist(id: number, status: string, episodesWatched: number) {
        if (user.profile == null){
            return
        }
        setLoading(true)
        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id + "/" + status+"/"+episodesWatched, {
            method: "PUT",
            headers: {
                'AuthToken': user.profile.idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (newlyAddedShow: Show) => {
                    let tempUserProfile = JSON.parse(JSON.stringify(user.profile));
                    let index = tempUserProfile.tvList.findIndex((show: Show) => show.id === newlyAddedShow.id)
                    if (index > -1) {
                        //Update users tvList with the new show status
                        tempUserProfile.tvList[index] = newlyAddedShow
                    } else {
                        //Add show to the top of the tvList
                        tempUserProfile.tvList.unshift(newlyAddedShow)
                    }
                    setLoading(false)

                    dispatch(set(tempUserProfile))
                }, (error) => {
                    setLoading(false)
                }
            )
    }

    function deleteFromWatchlist(id: number) {
        setLoading(true)
        if (user.profile == null){
            return
        }
        fetch(process.env.REACT_APP_HOST + "/api/v1/tv/" + id, {
            method: "DELETE",
            headers: {
                'AuthToken': user.profile.idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    let tempUserProfile = JSON.parse(JSON.stringify(user.profile));
                    for (let i = 0; i < tempUserProfile.tvList.length; i++) {
                        if (tempUserProfile.tvList[i].id === id) {
                            tempUserProfile.tvList.splice(i, 1)

                            break;
                        }
                    }
                    setShowStatus(null)
                    setLoading(false)
                    dispatch(set(tempUserProfile))
                }, (error) => {

                }
            )
    }

    if (user === null) {
        return <></>
    }
    return (
        <div className={"status-buttons"}>
            {showStatus !== null &&
            <div className={"watch-count"}>
                {editMode ? (
                    <>
                        Episodes watched: <input value={newEpisodesWatched} onChange={(e) => {
                        if (!isNaN(+e.target.value) && Number(e.target.value) <= (totalEpisodes || 0)) {
                            setNewEpisodesWatched(Number(e.target.value))
                        }
                    }
                    }/>/{totalEpisodes}
                        <button onClick={() => {
                            addShowToWatchlist(props.showID, showStatus || "plan-to-watch", newEpisodesWatched)
                            setEditMode(false)
                        }
                        }>Submit
                        </button>
                        <button onClick={() => setEditMode(false)}>Cancel Edit</button>
                    </>
                ) : (
                    <>
                        Episodes watched: {episodesWatched}/{totalEpisodes}
                        <button onClick={() => setEditMode(true)}>Edit</button>
                    </>
                )}

            </div>
            }

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

