import { useContext, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from "../App";
import { useForm } from 'react-hook-form';
import API from "../API";

function Header({ logout }) {

    const { user, httpClient } = useContext(UserContext);
    const { register, setError, formState: { errors }, handleSubmit } = useForm();
    const navigate = useNavigate();

    const [updatePassword, setUpdatePassword] = useState(false);
    const modalCloseBtn = useRef(null);

    const onLogout = () => {
        logout();
        if (window.location.pathname.includes('/editPost')) {
            navigate('/');
        }
    };

    const onUpdate = (data) => {

        if (updatePassword) {

            if (data.currentPassword === data.password) {
                // current password matching the new password
                setError('password', { type: 'match' });
                return;
            }

            if (data.password !== data.confirmPassword) {
                // confirm password does not match the new password
                setError('confirmPassword', { type: 'not_match' });
                return;
            }

            httpClient.put(`${API.USER}/password`, { ...data, 'id': user.id })
                .then(() => {
                    // logout user
                    logout();
                    navigate('/login');
                    modalCloseBtn.current.click();
                })
                .catch(error => {
                    if (error.response) {
                        if (error.response.status === 404) {
                            // current password incorrect
                            setError('currentPassword', { type: 'incorrect' });
                            return;
                        } else if (error.response.status === 409) {
                            // old password matching the new password
                            setError('password', { type: 'match' });
                            return;
                        }
                    }
                    // failed to update
                    console.error(error);
                });
        } else {

            if (user.username === data.username) {
                // current username matching the new username
                setError('username', { type: 'match' });
                return;
            }

            httpClient.put(`${API.USER}/username`, { ...data, 'id': user.id })
                .then(() => window.location.reload())
                .catch(error => {
                    if (!error.response || error.response.status !== 409) {
                        // response other than 409 (user already exists)
                        console.error(error);
                    }
                    setError('username', { type: 'exists' });
                });
        }
    };

    return (
        <div className="container">
            <header className="d-flex justify-content-between py-3">
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
                        <button className="d-block link-body-emphasis dropdown-toggle bg-transparent border-0" data-bs-toggle="dropdown" aria-expanded="false">
                            {user.username}
                        </button >
                        <ul className="dropdown-menu text-small">
                            <li><button className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editUserModal" onClick={() => setUpdatePassword(false)}>Change username</button></li>
                            <li><button className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editUserModal" onClick={() => setUpdatePassword(true)}>Change password</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item" onClick={onLogout}>Logout</button></li>
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
                        <form onSubmit={handleSubmit(onUpdate)}>
                            {updatePassword ? (
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="currentPassword" className="col-form-label">Current password:</label>
                                        <input key="currentPassword" type="password" className={`form-control ${errors.currentPassword && 'is-invalid'}`}
                                            placeholder="current password" {...register("currentPassword", { required: true })} />
                                        <div className="invalid-feedback">
                                            {errors.currentPassword?.type === 'required' && "Please enter current password"}
                                            {errors.currentPassword?.type === 'incorrect' && "Current password is incorrect"}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="col-form-label">New password:</label>
                                        <input key="password" type="password" className={`form-control ${errors.password && 'is-invalid'}`}
                                            placeholder="new password" {...register("password", { required: true })} />
                                        <div className="invalid-feedback">
                                            {errors.password?.type === 'required' && "Please enter new password"}
                                            {errors.password?.type === 'match' && "New password cannot be the same as the current password"}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="col-form-label">Confirm password:</label>
                                        <input key="confirmPassword" type="password" className={`form-control ${errors.confirmPassword && 'is-invalid'}`}
                                            placeholder="confirm password" {...register("confirmPassword")} />
                                        <div className="invalid-feedback">
                                            {errors.confirmPassword && "Does not match the new password"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="col-form-label">Username:</label>
                                        <input key="username" type="text" className={`form-control ${errors.username && 'is-invalid'}`}
                                            defaultValue={user && user.username}
                                            placeholder="username" {...register("username", { required: true, pattern: /^(?!\s*$).{1,}$/ })} />
                                        <div className="invalid-feedback">
                                            {errors.username?.type === 'required' && "Please enter username"}
                                            {errors.username?.type === 'match' && "New username cannot be the same as the current username"}
                                            {errors.username?.type === 'pattern' && "At least one character and not consist of only space(s)"}
                                            {errors.username?.type === 'exists' && "Username already exists"}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" ref={modalCloseBtn}>Cancel</button>
                                <button type="submit" className="btn btn-primary me-2">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Header;