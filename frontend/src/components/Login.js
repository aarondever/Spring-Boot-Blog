import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App"

function Login() {

    const { getUser, httpClient } = useContext(UserContext);
    const navigate = useNavigate();

    const [submitStatus, setSubmitStatus] = useState(0);
    const [usernameInvalidText, setusernameInvalidText] = useState(null);
    const [passwordInvalidText, setpasswordInvalidText] = useState(null);

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
            setSubmitStatus(1);
            setusernameInvalidText('用户名不能为空');
            return;
        }

        if (password.length === 0) {
            setSubmitStatus(2);
            setpasswordInvalidText('密码不能为空');
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
                setSubmitStatus(3);
                setusernameInvalidText('用户名或密码不正确');
                setpasswordInvalidText('用户名或密码不正确');
            });
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <form onSubmit={handleSubmit}>

                        <h1 className="h3 mb-3 fw-normal">登录</h1>

                        <div className="form-floating mb-3">
                            <input type="text" className={`form-control ${submitStatus === 1 || submitStatus === 3 ? 'is-invalid' : ''}`} 
                            placeholder="用户名" name="username" />
                            <label htmlFor='floatingInputValue'>用户名</label>
                            <div className="invalid-feedback">
                                {usernameInvalidText}
                            </div>
                        </div>

                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${submitStatus === 2 || submitStatus === 3 ? 'is-invalid' : ''}`} 
                            placeholder="密码" name="password" />
                            <label htmlFor='floatingInputValue'>密码</label>
                            <div className="invalid-feedback">
                                {passwordInvalidText}
                            </div>
                        </div>

                        <button className="btn btn-primary w-100 py-2" type="submit">登录</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;