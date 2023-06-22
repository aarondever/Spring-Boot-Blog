import { useContext } from "react";
import { UserContext } from "../App"

function Header() {

    const { user, getUser, httpClient } = useContext(UserContext);

    const logout = () => {
        httpClient.post('/api/logout')
            .then(() => getUser())
            .catch(error => console.error(error));
    };

    return (
        <div className="container">
            <header className="d-flex justify-content-center py-3">
                <ul className="nav nav-pills me-lg-auto mb-2 justify-content-center mb-md-0">
                    <li className="nav-item">
                        <a href="/" className="nav-link link-body-emphasis">首页</a>
                    </li>
                    <li className="nav-item">
                        <a href="/editPost" className="nav-link link-body-emphasis">发布文章</a>
                    </li>
                </ul>

                {user ? (
                    <div className="dropdown text-end">
                        <a href="#" className="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            {user.username}
                        </a>
                        <ul className="dropdown-menu text-small">
                            <li><a href="#" className="dropdown-item" onClick={logout}>注销</a></li>
                        </ul>
                    </div>
                ) : (
                    <div className="text-end">
                        <a href="login" className="btn btn-light text-dark me-2">登录</a>
                        <a href="signup" className="btn btn-primary">注册</a>
                    </div>
                )}

            </header>
        </div>
    );
}

export default Header;