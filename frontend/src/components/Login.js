import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App";

function Login() {

    const { getUser, httpClient } = useContext(UserContext);
    const navigate = useNavigate();
    
    const [invalidField, setInvalidField] = useState('');
    const [invalidText, setInvalidText] = useState(null);

    useEffect(() => {
        httpClient.get('/api/user')
            .then(() => {
                // user is logged in
                navigate('/');
                return;
            }).catch(error => console.log(error));
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const password = formData.get('password').trim();

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

        httpClient.post('/api/login', formData)
            .then(() => {
                getUser();
                if (window.history.length > 2) {
                    // has previous browser’s history
                    navigate(-1);
                } else {
                    navigate('/');
                }
            })
            .catch(() => {
                setInvalidField('username');
                setInvalidText('Username or password incorrect');
            });
    };

    return (
        <div className="container position-relative">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <form onSubmit={handleSubmit}>

                        <h1 className="h3 mb-3 fw-normal">Login</h1>

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

                        <button className="btn btn-primary w-100 py-2" type="submit">Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;