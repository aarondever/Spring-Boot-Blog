import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App"

function SignUp() {

    const { httpClient } = useContext(UserContext);
    const navigate = useNavigate();

    const [invalidField, setInvalidField] = useState('');
    const [invalidText, setInvalidText] = useState(null);

    useEffect(() => {
        // user in UserContext won't update in time in here, thus send request to api
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
        const confirmPassword = formData.get('confirm_password').trim();

        if (username.length === 0) {
            setInvalidField('username');
            setInvalidText('用户名不能为空');
            return;
        }

        if (password.length === 0) {
            setInvalidField('password');
            setInvalidText('密码不能为空');
            return;
        }

        if (password !== confirmPassword) {
            setInvalidField('confirm_password');
            setInvalidText('密码不匹配');
            return;
        }

        httpClient.post('/api/signup', { username, password })
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
                setInvalidText('用户名已存在');
            });
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <form onSubmit={handleSubmit}>
                        <h1 className="h3 mb-3 fw-normal">注册</h1>

                        <div className="form-floating mb-3">
                            <input type="text" className={`form-control ${invalidField === 'username' && 'is-invalid'}`}
                                placeholder="用户名" name="username" />
                            <label htmlFor='floatingInputValue'>用户名</label>
                            <div className="invalid-feedback">
                                {invalidText}
                            </div>
                        </div>

                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${invalidField === 'password' && 'is-invalid'}`}
                                placeholder="密码" name="password" />
                            <label htmlFor='floatingInputValue'>密码</label>
                            <div className="invalid-feedback">
                                {invalidText}
                            </div>
                        </div>

                        <div className="form-floating mb-3">
                            <input type="password" className={`form-control ${invalidField === 'confirm_password' && 'is-invalid'}`}
                                placeholder="确认密码" name="confirm_password" />
                            <label htmlFor='floatingInputValue'>确认密码</label>
                            <div className="invalid-feedback">
                                {invalidText}
                            </div>
                        </div>

                        <button className="btn btn-primary w-100 py-2" type="submit">注册</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;