import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App";
import { useForm } from 'react-hook-form';
import Loading from './Loading';
import API from '../API';

function Login({ getUser }) {

    const { user, httpClient, isSessionExpired, logout } = useContext(UserContext);
    const { register, setError, formState: { errors }, handleSubmit } = useForm();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const loginForm = useRef(null);

    useEffect(() => {

        setIsLoading(true);

        if (!user) {
            // user not logged in
            setIsLoading(false);
            return;
        }

        isSessionExpired()
            .then(expired => {
                if (expired) {
                    // session expired
                    logout();
                    setIsLoading(false);
                    return;
                }
                // user logged in
                navigate('/');
            });

    }, []);

    const onLogin = (data) => {

        const formData = new FormData(loginForm.current);
        setIsLoggingIn(true);

        httpClient.post(API.LOGIN, formData)
            .then(() => {
                getUser();
                setIsLoggingIn(false);
                if (window.history.length > 2) {
                    // has previous browser’s history
                    navigate(-1);
                } else {
                    navigate('/');
                }
            })
            .catch((error) => {
                if (!error.response || error.response.status !== 404) {
                    // response other than 404 (user not found)
                    console.error(error);
                }
                setError('username', { type: 'incorrect' });
            });
    };

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <form onSubmit={handleSubmit(onLogin)} ref={loginForm}>
                        <h3 className="mb-3 fw-normal">Login</h3>
                        <div className="form-floating mb-3">
                            <input type="text" className={`form-control ${errors.username && 'is-invalid'}`}
                                placeholder="username" {...register("username", { required: true, pattern: /^(?!\s*$).{1,30}$/ })} />
                            <label htmlFor='floatingInputValue'>Username</label>
                            <div className="invalid-feedback">
                                {errors.username?.type === 'required' && "Please enter username"}
                                {errors.username?.type === 'pattern' && "At least 1 character and at most 30 characters"}
                                {errors.username?.type === 'incorrect' && "Username and/or password is incorrect"}
                            </div>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${errors.password && 'is-invalid'}`}
                                placeholder="password" {...register("password", { required: true })} />
                            <label htmlFor='floatingInputValue'>Password</label>
                            <div className="invalid-feedback">
                                {errors.password && "Please enter password"}
                            </div>
                        </div>
                        {isLoggingIn ? (
                            <button className="btn btn-primary w-100 py-2" type="button" disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span className="visually-hidden" role="status">LoggingIn...</span>
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-primary w-100 py-2" type="submit">Login</button>
                            </>
                        )}
                    </form>
                </div>
            </div >
        </div >
    );
}

export default Login;