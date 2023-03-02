import React, {useEffect, useMemo, useState} from 'react';
import firebase from "firebase/compat/app";
import {AuthGoogle} from "./AuthGoogle";
import {onAuthStateChanged} from "firebase/auth"
import "./App.scss"
import {HeaderBar} from "./Components/HeaderBar/HeaderBar";
import {User} from "./interfaces/User";
import {Movies} from "./Components/WatchList/Movies/Movies";
import {Shows} from "./Components/WatchList/Shows/Shows";
import {useDispatch, useSelector} from "react-redux";
import {remove, set} from "./Store/userSlice";

// Configure Firebase.
const config = {
    apiKey: "AIzaSyADzX4PIUGtH6ULopSUj-W843b-QMvERQ4",
    authDomain: "didyou-watch.firebaseapp.com",
    projectId: "didyou-watch",
    storageBucket: "didyou-watch.appspot.com",
    messagingSenderId: "480007967702",
    appId: "1:480007967702:web:3084ac2d6218dee6c0ca77",
    measurementId: "G-RHRERR0P1Y"
}

function App() {
    firebase.initializeApp(config)
    const store = useSelector((state: any) => state.user);

    const [user, setUser] = useState<User>(store.user)
    const [userExists, setUserExists] = useState<User>(store.userExists)

    useEffect(() => {
        setUser(store.user)
        setUserExists(store.userExists)
    }, [store]);

    const value = useMemo(
        () => ({user, setUser}),
        [user]
    );
    const dispatch = useDispatch()

    useEffect(() => {
        onAuthStateChanged(firebase.auth() as any, (firebaseUser) => {
            if (firebaseUser == null) {
                dispatch(remove())
            } else {
                firebase.auth().currentUser?.getIdToken(true)
                    .then((idToken) => {
                        getAccount(idToken)
                    }).catch((error) => {
                    console.log(error)
                });
            }
        })
    }, []);

    function getAccount(idToken: string) {
        fetch(process.env.REACT_APP_HOST + "/account/v1/login", {
            method: "GET",
            headers: {
                'AuthToken': idToken
            }
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                }
            })
            .then(
                (result) => {
                    dispatch(set({
                        idToken: idToken,
                        uid: result.uid,
                        displayName: result.displayName,
                        profilePicURL: result.profilePicURL,
                        username: result.username,
                        movieList: result.movieList,
                        tvList: result.tvList
                    }))

                }, (error) => {
                    console.log(error)
                }
            )
    }

    function signOut() {
        firebase.auth().signOut().then(r => console.log("signed out"))
    }

    if (userExists) {
        return (
            <div className={"app"}>
                <HeaderBar user={user} signOut={signOut} idToken={user.idToken}/>
                <Movies/>
                <Shows/>
            </div>
        )
    }
    return (
        <div>
            <HeaderBar user={user} signOut={signOut} idToken={user.idToken}/>
            <AuthGoogle auth={firebase.auth()}/>
        </div>
    );
}

export default App;