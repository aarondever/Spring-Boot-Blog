import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App"
import Loading from './Loading';
import API from '../API';

function SignUp() {

    const { user, httpClient, isSessionExpired, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [invalidField, setInvalidField] = useState('');
    const [invalidText, setInvalidText] = useState(null);

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
                } else {
                    // user logged in
                    navigate('/');
                }
            });

    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const password = formData.get('password').trim();
        const confirmPassword = formData.get('confirm_password').trim();

        if (username.length === 0) {
            setInvalidField('username');
            setInvalidText('Please enter a username');
            return;
        }

        if (password.length === 0) {
            setInvalidField('password');
            setInvalidText('Please enter a password');
            return;
        }

        if (password !== confirmPassword) {
            setInvalidField('confirm_password');
            setInvalidText('Does not match password');
            return;
        }

        httpClient.post(API.SIGNUP, { username, password })
            .then(() => {
                if (window.history.length > 2) {
                    // has previous browser’s history
                    navigate(-1);
                } else {
                    navigate('/');
                }
            })
            .catch(() => {
                setInvalidField('username');
                setInvalidText('Username already exists');
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
                    <form onSubmit={handleSubmit}>
                        <h1 className="h3 mb-3 fw-normal">Sign-Up</h1>

                        <div className="form-floating mb-3">
                            <input type="text" className={`form-control ${invalidField === 'username' && 'is-invalid'}`}
                                placeholder="username" name="username" />
                            <label htmlFor='floatingInputValue'>Username</label>
                            <div className="invalid-feedback">
                                {invalidText}
                            </div>
                        </div>

                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${invalidField === 'password' && 'is-invalid'}`}
                                placeholder="password" name="password" />
                            <label htmlFor='floatingInputValue'>Password</label>
                            <div className="invalid-feedback">
                                {invalidText}
                            </div>
                        </div>

                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${invalidField === 'confirm_password' && 'is-invalid'}`}
                                placeholder="confirm password" name="confirm_password" />
                            <label htmlFor='floatingInputValue'>Confirm password</label>
                            <div className="invalid-feedback">
                                {invalidText}
                            </div>
                        </div>

                        <button className="btn btn-primary w-100 py-2" type="submit">Sign-Up</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;