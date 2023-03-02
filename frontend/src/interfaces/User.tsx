import {Movie} from "./Movie";
import {Show} from "./Show";

export interface User {
    idToken: string
    uid: string
    displayName: string
    profilePicURL: string
    username: string
    movieList: Movie[]
    tvList: Show[]
}