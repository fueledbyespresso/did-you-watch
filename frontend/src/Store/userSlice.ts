import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from "../interfaces/User";

type UserState = {
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
        },
        remove: state => {
            state = initialState
        },
    }
})

export const {set, remove} = userSlice.actions

export default userSlice.reducer