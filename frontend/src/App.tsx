import React, {useEffect} from 'react';
import firebase from "firebase/compat/app";
import {connectAuthEmulator, getAuth, onAuthStateChanged} from "firebase/auth"
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
import {ActorPage} from "./Pages/ActorPage";
import SignUp from "./SignUp";
import Login from "./Login";
// TODO Add more sorting features
// TODO Add follow other people
// TODO Add rankings
// TODO Add profile background
// TODO Redirect user to their own watchlist when they navigate to their own profile
// TODO Make overview expandable when too long
// TODO Style account page
// TODO Add Season view
// TODO Feature: Mark episode as viewed

// Configure Firebase.
// noinspection SpellCheckingInspection
const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || "")
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

function App() {
    const dispatch = useDispatch()
    if(process.env.NODE_ENV === "development"){
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
    }

    useEffect(() => {
        onAuthStateChanged(auth as any, (firebaseUser) => {
            if (firebaseUser === null) {
                console.log("no user logged in")
                dispatch(remove())
            } else {
                firebaseUser?.getIdToken(true)
                    .then((idToken) => {
                        getAccount(idToken)
                    }).catch((error) => {
                    console.log(error)
                });
            }
        })
        setInterval(() => {
            if (auth.currentUser === null) {
                console.log("no user logged in")
                dispatch(remove())
            } else {
                auth.currentUser?.getIdToken(true)
                    .then((idToken) => {
                        getAccount(idToken)
                    }).catch((error) => {
                    console.log(error)
                });
            }
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
            path: "login",
            element: <Login/>
        },{
            path:"signup",
            element: <SignUp/>
        },{
            path: "my-movies",
            element: <ProtectedRoute children={<Watchlist category={"movies"}/>}/>,
        }, {
            path: "my-shows",
            element: <ProtectedRoute children={<Watchlist category={"shows"}/>}/>,
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
        }, {
            path: "actor/:id",
            element: <ActorPage/>
        }],
    }
    ]);

    return (
        <RouterProvider router={router}/>
    )
}

export default App;