import React, {useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {getAuth, signInWithCustomToken} from 'firebase/auth';

const Signup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const location = useLocation()

    const onSubmit = async (e: any) => {
        e.preventDefault()
        const auth = getAuth();

        fetch(process.env.REACT_APP_HOST + "/account/v1/signup" , {
            method: "POST",
            body: JSON.stringify({"email": email, "password":password, "username": username, "displayname": displayName})
        })
            .then(async (res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    throw new Error(await res.text())
                }
            })
            .then(
                (result) => {
                    signInWithCustomToken(auth, result)
                        .then((userCredential) => {
                            if(location.key !== 'default'){
                                navigate(-1)
                            }else{
                                navigate("/")
                            }
                        })
                        .catch((error) => {
                            const errorCode = error.code;
                            const errorMessage = error.message;
                            // ...
                        });

                }, (error: Error) => {
                    console.log(error.message)
                }
            )
    }

    return (
        <section>
            <div>
                <div>
                    <form>
                        <div>
                            <label htmlFor="email-address">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="password">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="username">
                                username
                            </label>
                            <input
                                type="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="username"
                            />
                        </div>
                        <div>
                            <label htmlFor="displayname">
                                displayname
                            </label>
                            <input
                                type="displayname"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                placeholder="Display name"
                            />
                        </div>
                        <button
                            type="submit"
                            onClick={onSubmit}
                        >
                            Sign up
                        </button>

                    </form>

                    <p>
                        Already have an account?{' '}
                        <NavLink to="/login">
                            <u>Sign in</u>
                        </NavLink>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Signup