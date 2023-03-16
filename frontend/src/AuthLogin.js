import React, {useEffect} from "react";
import * as firebaseui from "firebaseui";
import firebase from "firebase/compat/app";
import 'firebaseui/dist/firebaseui.css'

export function AuthLogin() {
    useEffect(() => {
        let ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth())

        ui.start('.firebaseui-auth-container', {
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                // Avoid redirects after sign-in.
                signInSuccessWithAuthResult: () => false,
            },
        });
    }, [])

    return (
        <div>
            <div className={"firebaseui-auth-container"}></div>
        </div>
    )
}