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
// TODO Change user variable name to be pragmatic
export function MovieStatusCard(props: { movieID: number }) {
    const user = useSelector((state: { user: UserState }) => state.user);
    const dispatch = useDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [curMovieStatus, setCurMovieStatus] = useState<string | null>(null)

    useEffect(() => {
        let matchingShow = user.user.movieList.filter(obj => {
            return obj.id === props.movieID
        })
        if (matchingShow.length > 0) {
            setCurMovieStatus(matchingShow[0].status)
        }
    }, [user]);


    function addMovieToWatchlist(id: number, status: string) {
        setLoading(true)
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/" + id + "/" + status, {
            method: "PUT",
            headers: {
                'AuthToken': user.user.idToken
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
                    for (let i = 0; i < tempUser.movieList.length; i++) {
                        if (tempUser.movieList[i].id === result.id) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        tempUser.movieList[index] = result
                    } else {
                        tempUser.movieList.unshift(result)
                    }

                    dispatch(set(tempUser))
                    setLoading(false)
                }, (error) => {
                    setLoading(false)
                }
            )
    }

    function deleteFromWatchlist(id: number) {
        fetch(process.env.REACT_APP_HOST + "/api/v1/movie/" + id, {
            method: "DELETE",
            headers: {
                'AuthToken': user.user.idToken
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

    if (!user.userExists) {
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

