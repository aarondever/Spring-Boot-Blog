import { useContext, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
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
                setInvalidText('Please enter a password');
                return;
            }

            if (password.length === 0) {
                setInvalidField('password');
                setInvalidText('Please enter a new password');
                return;
            }

            if (oldPassword === password) {
                setInvalidField('password');
                setInvalidText('Cannot matching orignial password');
                return;
            }

            if (confirmPassword !== password) {
                setInvalidField('confirm_password');
                setInvalidText('Does not match new password');
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
                            setInvalidText('Password incorrect');

                        } else if (error.response.status === 409) {
                            // old password same with new password
                            setInvalidField('password');
                            setInvalidText('Cannot matching orignial password');
                        }
                    }
                    // failed to update
                    console.error(error);
                });
        } else {
            const username = formData.get('username').trim();

            if (user.username === username) {
                setInvalidField('username');
                setInvalidText('Cannot matching original username');
                return;
            }

            if (username.length === 0) {
                setInvalidField('username');
                setInvalidText('Please enter a username');
                return;
            }

            httpClient.put('/api/user/username', { 'id': user.id, username })
                .then(() => window.location.reload())
                .catch(error => {
                    if (error.response && error.response.status === 409) {
                        // username already exists
                        setInvalidField('username');
                        setInvalidText('Username already exists');
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
                        <Link to="/" className={`nav-link link-body-emphasis ${window.location.pathname === '/' && 'active'}`}>Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/editPost" className={`nav-link link-body-emphasis ${window.location.pathname === '/editPost' && 'active'}`}>New Post</Link>
                    </li>
                </ul>

                {user ? (
                    <div className="dropdown text-end">
                        <a href="#" className="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            {user.username}
                        </a>
                        <ul className="dropdown-menu text-small">
                            <li><a href="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editUserModal" onClick={() => setUpdatePassword(false)}>Change username</a></li>
                            <li><a href="#" className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editUserModal" onClick={() => setUpdatePassword(true)}>Change password</a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><a href="#" className="dropdown-item" onClick={logout}>Logout</a></li>
                        </ul>
                    </div>
                ) : (
                    <div className="text-end">
                        <Link to="/login" className="btn btn-light text-dark me-2">Login</Link>
                        <Link to="/signup" className="btn btn-primary">Sign-Up</Link>
                    </div>
                )}

            </header>
            <div className="modal fade" id="editUserModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Change {updatePassword ? 'password' : 'username'}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {updatePassword ? (
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="old-password" className="col-form-label">Original password:</label>
                                        <input key="old_password" type="password" className={`form-control ${invalidField === 'old_password' && 'is-invalid'}`}
                                            placeholder="original password" name="old_password" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="col-form-label">New password:</label>
                                        <input key="password" type="password" className={`form-control ${invalidField === 'password' && 'is-invalid'}`}
                                            placeholder="new password" name="password" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirm-password" className="col-form-label">Confirm password:</label>
                                        <input key="confirm_password" type="password" className={`form-control ${invalidField === 'confirm_password' && 'is-invalid'}`}
                                            placeholder="confirm password" name="confirm_password" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="col-form-label">Username:</label>
                                        <input key="username" type="text" className={`form-control ${invalidField === 'username' && 'is-invalid'}`}
                                            defaultValue={user && user.username}
                                            placeholder="username" name="username" />
                                        <div className="invalid-feedback">
                                            {invalidText}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary me-2">Save</button>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Header;