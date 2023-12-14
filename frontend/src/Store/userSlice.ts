import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from "../Types/User";
import {store} from "./store";

export type UserState = {
    profile: User | null,
}

const initialState: UserState = {
    /*    profile: {
            idToken: "",
            uid: "",
            displayName: "",
            profilePicURL: "",
            username: "",
            darkMode: localStorage.getItem('darkTheme') === "true",
            movieList: [],
            tvList: [],
        }*/
    profile: null
}


export const userSlice = createSlice({
    name: 'user',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        set: (state: UserState, action: PayloadAction<User>) => {
            state.profile = action.payload
            localStorage.setItem('darkTheme', state.profile.darkMode.toString())
        },
        remove: (state: UserState) => {
            state.profile = null
        },
    }
})

export type RootState = ReturnType<typeof store.getState>

export const {set, remove} = userSlice.actions

export default userSlice.reducer