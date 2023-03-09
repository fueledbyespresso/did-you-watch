import React, {useEffect} from 'react';
import firebase from "firebase/compat/app";
import {onAuthStateChanged} from "firebase/auth"
import "./App.scss"

import {useDispatch} from "react-redux";
import {remove, set} from "./Store/userSlice";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Watchlist} from "./Pages/Watchlist";
import {Home} from "./Pages/Home";
import {ErrorPage} from "./Pages/ErrorPage";
import {Account} from "./Pages/Account";
import ProtectedRoute from "./Pages/ProtectedRoute";
import {TVShowPage} from "./Pages/TVShowPage";
import {MoviePage} from "./Pages/MoviePage";
import {Root} from "./Components/Root/Root";
import {UserPage} from "./Pages/UserPage";
// TODO Add a calendar page.
// TODO Add actor page
// TODO Add more sorting features
// TODO Style buttons better
// TODO Add follow
// TODO Add rankings
// TODO Add profile background
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
    const dispatch = useDispatch()

    useEffect(() => {
        onAuthStateChanged(firebase.auth() as any, (firebaseUser) => {
            console.log(firebaseUser)
            if (firebaseUser === null) {
                console.log("no user logged in")
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
        setInterval(() => {
            firebase.auth().currentUser?.getIdToken(true)
        }, 300000);
    }, [])

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
                        darkMode: result.darkMode,
                        movieList: result.movieList,
                        tvList: result.tvList
                    }))
                }, (error) => {
                    console.log(error)
                }
            )
    }

    const router = createBrowserRouter([{
        path: "/",
        element: <Root/>,
        errorElement: <ErrorPage/>,
        children: [{
            path: "",
            element: <Home/>,
        }, {
            path: "my-movies",
            element: <Watchlist category={"movies"}/>,
        }, {
            path: "my-shows",
            element: <Watchlist category={"shows"}/>,
        }, {
            path: "account",
            element: <ProtectedRoute children={<Account/>}/>,
        }, {
            path: "show/:id",
            element: <TVShowPage/>
        }, {
            path: "movie/:id",
            element: <MoviePage/>
        }, {
            path: "user/:id",
            element: <UserPage/>
        }],
    }
    ]);

    return (
        <RouterProvider router={router}/>
    )
}

export default App;