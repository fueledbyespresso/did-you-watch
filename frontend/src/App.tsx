import React, {useEffect} from 'react';
import firebase from "firebase/compat/app";
import {onAuthStateChanged} from "firebase/auth"
import "./App.scss"

import {useDispatch, useSelector} from "react-redux";
import {remove, set} from "./Store/userSlice";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Watchlist} from "./Pages/Watchlist";
import {Home} from "./Pages/Home";
import {ErrorPage} from "./Pages/ErrorPage";
import {Account} from "./Pages/Account";
import ProtectedRoute from "./Pages/ProtectedRoute";
import {UserProfile} from "./Pages/UserProfile";
import {TVShowPage} from "./Pages/TVShowPage";
import {MoviePage} from "./Pages/MoviePage";

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
            element: <Home/>,
            errorElement: <ErrorPage />,
        }, {
            path: "my-watchlist",
            element: <Watchlist />,
        }, {
            path: "account",
            element: <ProtectedRoute children={<Account/>}/>,
        }, {
            path: "user/:id",
            element: <UserProfile/>
        }, {
            path: "show/:id",
            element: <TVShowPage/>
        }, {
            path: "movie/:id",
            element: <MoviePage/>
        }
    ]);

    return (
        <RouterProvider router={router}/>
    )
}

export default App;