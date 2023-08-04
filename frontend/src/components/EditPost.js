import { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from "../App"
import Loading from './Loading';
import API from '../API';

function EditPost() {

    const { user, httpClient, isSessionExpired, logout } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [invalidField, setInvalidField] = useState('');
    const [invalidText, setInvalidText] = useState(null);
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
                    return;
                }
                // user logged in
                return isSessionExpired(expired);
            }).then(() => {
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

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();
        const image = formData.get('image');

        if (title.length === 0) {
            setInvalidField('title');
            setInvalidText('Please enter a title');
            return;
        }

        if (content.length === 0) {
            setInvalidField('content');
            setInvalidText('Please enter a content');
            return;
        }

        if (image.size > 0) {
            if (image.type !== 'image/jpeg' && image.type !== 'image/png') {
                // image type invalid
                setInvalidField('image');
                setInvalidText("Image type invalid");
                return;
            }

            if (image.size > 5 * 1024 * 1024) {
                // image is too large
                setInvalidField('image');
                setInvalidText("Image size needs to be < 5MB");
                return;
            }
        }

        if (id) {
            // update
            httpClient.put(`${API.POST}/${id}`, formData)
                .then(() => {
                    if (window.history.length > 2) {
                        // has previous browser’s history
                        navigate(-1);
                    } else {
                        navigate('/');
                    }
                })
                .catch(error => {
                    invalidImage(error);
                    console.error(error);
                });
        } else {
            // insert
            httpClient.post(API.POST, formData)
                .then(() => {
                    if (window.history.length > 2) {
                        // has previous browser’s history
                        navigate(-1);
                    } else {
                        navigate('/');
                    }
                })
                .catch(error => {
                    invalidImage(error);
                    console.error(error);
                });
        }
    };

    const invalidImage = (error) => {
        if (error.response) {
            setInvalidField('image');
            if (error.response.status === 413) {
                // image is too large
                setInvalidText("Image size needs to be < 5MB");
            } else {
                // image type invalid
                setInvalidText("Image type invalid");
            }
        } else {
            console.log(error);
        }
    }

    if (isLoading) {
        return (
            <Loading />
        );
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <form onSubmit={handleSubmit}>
                        <div className="card">
                            <div className="card-header">Post</div>
                            <div className="card-body">
                                <div className="form-group mb-3">
                                    <label htmlFor="title">Title:</label>
                                    <input type="text" name="title" className={`form-control ${invalidField === 'title' && 'is-invalid'}`}
                                        defaultValue={post.current ? post.current.title : null} />
                                    <div className="invalid-feedback">
                                        {invalidText}
                                    </div>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="content">Content:</label>
                                    <textarea name="content" className={`form-control ${invalidField === 'content' && 'is-invalid'}`}
                                        defaultValue={post.current ? post.current.content : null} ></textarea>
                                    <div className="invalid-feedback">
                                        {invalidText}
                                    </div>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="image">Image:</label>
                                    <input type="file" name="image" className={`form-control ${invalidField === 'image' && 'is-invalid'}`}
                                        accept='.jpg,.jpeg,.png' />
                                    {invalidField !== 'image' && (
                                        <div className="form-text">
                                            Image type: jpeg, jpg, png, Image size: &lt; 5MB
                                        </div>
                                    )}
                                    <div className="invalid-feedback">
                                        {invalidText}
                                    </div>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="tags">Tags:</label>
                                    <textarea name="tags" className="form-control" defaultValue={post.current ? post.current.tags.map(tag => tag.name).join(' ') : null}></textarea>
                                    <div className="form-text">
                                        Separate tags with spaces. (ex: python java programming_language)
                                    </div>
                                </div>
                                <button type="submit" name="btnPost" className="btn btn-primary">
                                    {id ? 'Save' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


export default EditPost;