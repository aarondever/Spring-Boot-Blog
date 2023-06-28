import { useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App";

function Header() {

    const { user, getUser, httpClient } = useContext(UserContext);
    const navigate = useNavigate();

    const [updatePassword, setUpdatePassword] = useState(false);
    const [invalidField, setInvalidField] = useState('');
    const [invalidText, setInvalidText] = useState(null);

    const logout = () => {
        httpClient.post('/api/logout')
            .then(() => getUser())
            .catch(error => console.error(error));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        if (updatePassword) {
            const oldPassword = formData.get('old_password').trim();
            const password = formData.get('password').trim();
            const confirmPassword = formData.get('confirm_password').trim();

            if (oldPassword.length === 0) {
                setInvalidField('old_password');
                setInvalidText('原密码不能为空');
                return;
            }

            if (password.length === 0) {
                setInvalidField('password');
                setInvalidText('新密码不能为空');
                return;
            }

            if (oldPassword === password) {
                setInvalidField('password');
                setInvalidText('原密码和新密码一致');
                return;
            }

            if (confirmPassword !== password) {
                setInvalidField('confirm_password');
                setInvalidText('确认新密码和新密码不一致');
                return;
            }

            httpClient.put('/api/user/password', { 'id': user.id, password, oldPassword })
                .then(() => {
                    // logout user
                    logout();
                    navigate('/login');
                    window.location.reload();
                })
                .catch(error => {
                    if (error.response) {
                        if (error.response.status === 404) {
                            // old password incorrect
                            setInvalidField('old_password');
                            setInvalidText('原密码错误');

                        } else if (error.response.status === 409) {
                            // old password same with new password
                            setInvalidField('password');
                            setInvalidText('原密码和新密码一致');
                        }
                    }
                    // failed to update
                    console.error(error);
                });
        } else {
            const username = formData.get('username').trim();

            if (user.username === username) {
                setInvalidField('username');
                setInvalidText('新用户名和原用户名一致');
                return;
            }

            if (username.length === 0) {
                setInvalidField('username');
                setInvalidText('用户名不能为空');
                return;
            }

            httpClient.put('/api/user/username', { 'id': user.id, username })
                .then(() => window.location.reload())
                .catch(error => {
                    if (error.response && error.response.status === 409) {
                        // username already exists
                        setInvalidField('username');
                        setInvalidText('用户名已存在');
                    } else {
                        // failed to update
                        console.error(error);
                    }
                });
        }
    };

    return (
        <div className="container">
            <header className="d-flex justify-content-center py-3">
                <ul className="nav nav-pills me-lg-auto mb-2 justify-content-center mb-md-0">
                    <li className="nav-item">
                        <a href="/" className={`nav-link link-body-emphasis ${window.location.pathname === '/' && 'active'}`}>首页</a>
                    </li>
                    <li className="nav-item">
                        <a href="/editPost" className={`nav-link link-body-emphasis ${window.location.pathname === '/editPost' && 'active'}`}>发布文章</a>
                    </li>
                </ul>

                {user ? (
                    <div className="dropdown text-end">
                        <a href="#" className="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            {user.username}
                        </a>
                        <ul className="dropdown-menu text-small">
                            <li><a href="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editUserModal" onClick={() => setUpdatePassword(false)}>修改用户名</a></li>
                            <li><a href="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editUserModal" onClick={() => setUpdatePassword(true)}>修改密码</a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><a href="#" className="dropdown-item" onClick={logout}>退出登录</a></li>
                        </ul>
                    </div>
                ) : (
                    <div className="text-end">
                        <a href="/login" className="btn btn-light text-dark me-2">登录</a>
                        <a href="/signup" className="btn btn-primary">注册</a>
                    </div>
                )}

            </header>
            <div className="modal fade" id="editUserModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">修改{updatePassword ? '密码' : '用户名'}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {updatePassword ? (
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="old-password" className="col-form-label">旧密码:</label>
                                        <input key="old_password" type="password" className={`form-control ${invalidField === 'old_password' && 'is-invalid'}`}
                                            placeholder="旧密码" name="old_password" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="col-form-label">新密码:</label>
                                        <input key="password" type="password" className={`form-control ${invalidField === 'password' && 'is-invalid'}`}
                                            placeholder="新密码" name="password" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirm-password" className="col-form-label">确认新密码:</label>
                                        <input key="confirm_password" type="password" className={`form-control ${invalidField === 'confirm_password' && 'is-invalid'}`}
                                            placeholder="确认新密码" name="confirm_password" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="col-form-label">用户名:</label>
                                        <input key="username" type="text" className={`form-control ${invalidField === 'username' && 'is-invalid'}`}
                                            defaultValue={user && user.username}
                                            placeholder="用户名" name="username" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary me-2">保存</button>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Header;