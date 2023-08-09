import { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from "../App"
import Loading from './Loading';
import API from '../API';
import PostForm from './PostForm';

function EditPost() {

    const { user, httpClient, isSessionExpired, logout } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    const post = useRef(null);

    useEffect(() => {

        setIsLoading(true);

        if (!user) {
            // user not logged in
            navigate('/login');
            return;
        }

        isSessionExpired()
            .then(expired => {
                if (expired) {
                    // session expired
                    logout();
                    navigate('/login');
                }
                return expired;
            }).then((expired) => {
                if (expired) { return; }
                // user logged in
                if (id) {
                    httpClient.get(`${API.POST}/${id}`)
                        .then(response => {
                            post.current = response.data;
                            if (user.id !== post.current.user.id) {
                                // user isn't the author
                                navigate('/');
                                return;
                            }
                            setIsLoading(false);
                        }).catch(error => {
                            if (!error.response || error.response.status !== 404) {
                                // response other than 404 (post not found)
                                console.error(error);
                            }
                            navigate('/');
                        });
                } else {
                    setIsLoading(false);
                }
            });

    }, []);

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <PostForm id={id} post={post} />
                </div>
            </div>
        </div>
    );
}


export default EditPost;