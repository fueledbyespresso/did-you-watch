import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from "../Types/User";

export type UserState = {
    user: User,
    userExists: boolean
}

const initialState: UserState = {
    user: {
        idToken: "",
        uid: "",
        displayName: "",
        profilePicURL: "",
        username: "",
        darkMode: localStorage.getItem('darkTheme') === "true",
        movieList: [],
        tvList: [],
    },
    userExists: false
}


export const userSlice = createSlice({
    name: 'user',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        set: (state, action: PayloadAction<User>) => {
            state.user = action.payload
            state.userExists = true
            localStorage.setItem('darkTheme', state.user.darkMode.toString())
        },
        remove: state => {
            state.user = {
                idToken: "",
                uid: "",
                displayName: "",
                profilePicURL: "",
                username: "",
                darkMode: false,
                movieList: [],
                tvList: [],
            }
            state.userExists = false
        },
    }
})

export const {set, remove} = userSlice.actions

export default userSlice.reducer