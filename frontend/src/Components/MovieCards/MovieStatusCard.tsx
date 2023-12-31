import {useDispatch, useSelector} from "react-redux";
import {RootState, set, UserState} from "../../Store/userSlice";
import React, {useEffect, useState} from "react";

const status_types = [
    {value: 'plan-to-watch', label: 'Plan to Watch'},
    {value: 'started', label: 'Started'},
    {value: 'completed', label: 'Completed'},
    {value: 'dropped', label: 'Dropped'},
]
export function MovieStatusCard(props: { movieID: number }) {
    const user = useSelector<RootState, UserState>((state) => state.user);
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [curMovieStatus, setCurMovieStatus] = useState<string | null>(null)

    useEffect(() => {
        if(user.profile !== null){
            let matchingShow = user.profile.movieList.filter(obj => {
                return obj.id === props.movieID
            })
            if (matchingShow.length > 0) {
                setCurMovieStatus(matchingShow[0].status)
            }
        }

    }, [user]);


    function addMovieToWatchlist(id: number, status: string) {
        if (user.profile == null){
            return
        }
        setLoading(true)
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/" + id + "/" + status, {
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
                (result) => {
                    let tempUserProfile = JSON.parse(JSON.stringify(user.profile));
                    let index = -1;
                    for (let i = 0; i < tempUserProfile.movieList.length; i++) {
                        if (tempUserProfile.movieList[i].id === result.id) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUserProfile.movieList[index] = result
                    } else {
                        tempUserProfile.movieList.unshift(result)
                    }

                    dispatch(set(tempUserProfile))
                    setLoading(false)
                }, (error) => {
                    setLoading(false)
                }
            )
    }

    function deleteFromWatchlist(id: number) {
        if (user.profile == null){
            return
        }
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/" + id, {
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
                    let tempUser = JSON.parse(JSON.stringify(user.profile));
                    for (let i = 0; i < tempUser.movieList.length; i++) {
                        if (tempUser.movieList[i].id === id) {
                            tempUser.movieList.splice(i, 1)
                            break;
                        }
                    }
                    setCurMovieStatus(null)
                    dispatch(set(tempUser))
                    console.log(result)
                }, (error) => {

                }
            )
    }

    if (user === null) {
        return <></>
    }
    return (
        <div className={"status-buttons"}>
            {loading && <div>"Loading..."</div>}
            {status_types.map((status) => (
                <button className={status.value}
                        key={status.value}
                        tabIndex={3}
                        disabled={curMovieStatus === status.value}
                        onClick={() => addMovieToWatchlist(props.movieID, status.value)}>
                    {status.label}
                </button>
            ))}
            <button onClick={() => deleteFromWatchlist(props.movieID)}
                    className={"delete"}>Remove
            </button>
        </div>
    )
}

