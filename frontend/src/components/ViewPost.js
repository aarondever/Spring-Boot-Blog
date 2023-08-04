import { useParams, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from "../App";
import Loading from './Loading';
import API from '../API';

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function ViewPost() {

    const { user, httpClient } = useContext(UserContext);
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        setIsLoading(true);

        httpClient.get(`${API.POST}/${id}`)
            .then(response => {
                setPost(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                if (!error.response || error.response.status !== 404) {
                    // response other than 404 (post not found)
                    console.error(error);
                }
                navigate('/');
            });

    }, []);

    const deletePost = (id) => {
        httpClient.delete(`/api/post/${id}`)
            .then(() => {
                if (window.history.length > 2) {
                    // has previous browser’s history
                    navigate(-1);
                } else {
                    navigate('/');
                }
            })
            .catch(error => console.error(error));
    }

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <div className="container">
            {post ? (
                <div className="row">
                    <div className="col-md-4">
                        <h2 className="display-5 text-body-emphasis mb-1">{post.title}</h2>
                    </div>
                    {user && user.id === post.user.id && (
                        // login user is the author
                        <div className="col-md-4 offset-md-4">
                            <a href={`/editPost/${post.id}`} className="btn btn-primary me-2">Edit</a>
                            <button type="button" name="btnDelete" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal">Delete</button>
                        </div>
                    )}
                    <p className="blog-post-meta">{formatDate(post.createdAt)} by {post.user.username}</p>
                    {post.image && (
                        <p>
                            <img
                                src={`../images/${post.image}`}
                                className="d-block mx-auto img-fluid object-fit-scale"
                                alt="post"
                                loading="lazy"
                                style={{ width: "700px", height: "500px" }}
                            />
                        </p>
                    )}
                    <p>{post.content}</p>
                </div>
            ) : (
                <div className="spinner-border text-primary">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}

            <div className="modal fade" id="deletePostModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Delete Post</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-truncate">
                                Are you sure you wanna delete '{post && post.title}'?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => deletePost(post.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewPost;