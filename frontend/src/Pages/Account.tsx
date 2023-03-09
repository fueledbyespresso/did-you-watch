import {useDispatch, useSelector} from "react-redux";
import {set, UserState} from "../Store/userSlice";
import {useEffect, useState} from "react";

export function Account(){
    const user = useSelector((state: {user:UserState }) => state.user).user;
    const [editUsernameMode, setEditUsernameMode] = useState<boolean>(false)
    const [editDisplayNameMode, setEditDisplayNameMode] = useState<boolean>(false)
    const [changeAvatarMode, setChangeAvatarMode] = useState<boolean>(false)

    const [newUsername, setNewUsername] = useState<string>("")
    const [newDisplayName, setNewDisplayName] = useState<string>("")
    const [newAvatar, setNewAvatar] = useState<string|null>(null)

    const [availableAvatars, setAvailableAvatars] = useState<any>(null)

    const [error, setError] = useState<string | null>(null)

    const dispatch = useDispatch()

    useEffect(() => {
        getAvailableAvatars()
    }, [])
    function getAvailableAvatars() {
        fetch(process.env.REACT_APP_HOST + "/account/v1/avatars", {
            method: "GET",
        })
            .then(async (res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error(await res.text())
                }
            })
            .then(
                (result) => {
                    setAvailableAvatars(result)
                    setError(null)
                }, (error: Error) => {
                    console.log(error.message)
                    setError(error.message)
                }
            )
    }
    function updateUsername() {
        fetch(process.env.REACT_APP_HOST + "/account/v1/username/" + newUsername, {
            method: "PUT",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then(async (res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error(await res.text())
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    tempUser.username = result.username
                    dispatch(set(tempUser))
                    console.log("Successful username change!")
                    setError(null)
                    setEditUsernameMode(false)
                }, (error: Error) => {
                    console.log(error.message)
                    setError(error.message)
                }
            )
    }

    function updateDisplayName() {
        fetch(process.env.REACT_APP_HOST + "/account/v1/displayName/" + newDisplayName, {
            method: "PUT",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then(async (res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error(await res.text())
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    tempUser.displayName = result.displayName
                    dispatch(set(tempUser))
                    console.log("Successful display name change!")
                    setError(null)
                    setEditDisplayNameMode(false)
                }, (error: Error) => {
                    console.log(error.message)
                    setError(error.message)
                }
            )
    }

    function updateAvatar() {
        fetch(process.env.REACT_APP_HOST + "/account/v1/avatar/" + newAvatar, {
            method: "PUT",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then(async (res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error(await res.text())
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    tempUser.profilePicURL = result.profilePicURL
                    dispatch(set(tempUser))
                    console.log("Successful avatar change!")
                    setError(null)
                    setChangeAvatarMode(false)
                }, (error: Error) => {
                    console.log(error.message)
                    setError(error.message)
                }
            )
    }

    function toggleDarkMode() {
        fetch(process.env.REACT_APP_HOST + "/account/v1/toggleDarkMode", {
            method: "PUT",
            headers: {
                'AuthToken': user.idToken
            }
        })
            .then(async (res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error(await res.text())
                }
            })
            .then(
                (result) => {
                    let tempUser = JSON.parse(JSON.stringify(user));
                    tempUser.darkMode = result
                    dispatch(set(tempUser))
                    console.log("Dark mode toggled. Dark mode on:"+result)
                    setError(null)
                }, (error: Error) => {
                    console.log(error.message)
                    setError(error.message)
                }
            )
    }
    return(
        <div className={"account-page"}>
            <h1>Account</h1>
            <div className={"account-details-section"}>
                {!changeAvatarMode ?
                    <div>
                        <img src={user.profilePicURL} alt={"profile"}/>
                        <button onClick={()=> {
                            setChangeAvatarMode(true)
                            setNewAvatar(null)
                        }}>Change Avatar</button>
                    </div>
                    :
                    <div>
                        <div className={"current-avatar"}>
                            <h2>Current Avatar</h2>
                            <img src={newAvatar === null ? user.profilePicURL : availableAvatars[newAvatar] }
                                 alt={""}/>
                        </div>
                        {availableAvatars !== null &&
                            Object.keys(availableAvatars).map(key => {
                                return (
                                    <img key={key}
                                         src={availableAvatars[key]}
                                         onClick={()=>setNewAvatar(key)}
                                         alt={""}/>
                                )
                            })
                        }
                        <div className={"edit-buttons"}>
                            <button onClick={()=>updateAvatar()}>Change Avatar</button>
                            <button onClick={()=>setChangeAvatarMode(false)}>Cancel Edit</button>
                        </div>
                    </div>
                }

                {!editDisplayNameMode ?
                    <div>
                        Display name: {user.displayName}
                        <button onClick={()=> {
                            setEditDisplayNameMode(true)
                            setNewDisplayName(user.displayName)
                        }}>Edit</button>
                    </div>
                    :
                    <div>
                        <input onChange={(e)=>setNewDisplayName(e.target.value)} value={newDisplayName} placeholder={user.displayName}/>
                        <button onClick={()=>updateDisplayName()}>Change name</button>
                        <button onClick={()=>setEditDisplayNameMode(false)}>Cancel Edit</button>
                    </div>
                }
                {!editUsernameMode ?
                    <div>
                        Username: {user.username}
                        <button onClick={()=> {
                            setEditUsernameMode(true)
                            setNewUsername(user.username)
                        }}>Edit</button>
                    </div>
                    :
                    <div>
                        <input onChange={(e)=>setNewUsername(e.target.value)} value={newUsername} placeholder={user.username}/>
                        <button onClick={()=>updateUsername()}>Change name</button>
                        <button onClick={()=>setEditUsernameMode(false)}>Cancel Edit</button>
                    </div>
                }
                <button onClick={()=>toggleDarkMode()}>{user.darkMode ? "Enable Light Mode": "Enable Dark Mode"}</button>
                <div>
                    {error}
                </div>
            </div>
        </div>
    )
}