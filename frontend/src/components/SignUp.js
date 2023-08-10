import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App"
import { useForm } from 'react-hook-form';
import Loading from './Loading';
import API from '../API';

function SignUp() {

    const { user, httpClient, isSessionExpired, logout } = useContext(UserContext);
    const { register, setError, formState: { errors }, handleSubmit } = useForm();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);

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

    const onSignUp = (data) => {

        if (data.password !== data.confirmPassword) {
            setError('confirmPassword', { type: 'not_match' });
            return;
        }

        setIsSigningUp(true);
        httpClient.post(API.SIGNUP, data)
            .then(() => {
                setIsSigningUp(false);
                if (window.history.length > 2) {
                    // has previous browser’s history
                    navigate(-1);
                } else {
                    navigate('/');
                }
            })
            .catch((error) => {
                if (!error.response || error.response.status !== 409) {
                    // response other than 409 (user already exists)
                    console.error(error);
                }
                setError('username', { type: 'exists' });
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
                    <form onSubmit={handleSubmit(onSignUp)}>
                        <h3 className="mb-3 fw-normal">Sign-Up</h3>
                        <div className="form-floating mb-3">
                            <input type="text" className={`form-control ${errors.username && 'is-invalid'}`}
                                placeholder="username" {...register("username", { required: true, pattern: /^(?!\s*$).{1,30}$/ })} />
                            <label htmlFor='floatingInputValue'>Username</label>
                            <div className="invalid-feedback">
                                {errors.username?.type === 'required' && "Please enter username"}
                                {errors.username?.type === 'pattern' && "At least 1 character and at most 30 characters"}
                                {errors.username?.type === 'exists' && "Username already exists"}
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
                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${errors.confirmPassword && 'is-invalid'}`}
                                placeholder="confirm password" {...register("confirmPassword")} />
                            <label htmlFor='floatingInputValue'>Confirm password</label>
                            <div className="invalid-feedback">
                                {errors.confirmPassword && "Does not match the new password"}
                            </div>
                        </div>
                        {isSigningUp ? (
                            <button className="btn btn-primary w-100 py-2" type="button" disabled>
                                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                <span className="visually-hidden" role="status">SigningUp...</span>
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-primary w-100 py-2" type="submit">Sign-Up</button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;