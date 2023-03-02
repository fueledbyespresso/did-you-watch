import {createContext} from 'react';

export const UserContext = createContext<any>({
    user: {
        idToken: "",
        uid: "",
        displayName: "",
        profilePicURL: "",
        username: "",
        movieList: []
    },
    setUser: () => {
    },
});
