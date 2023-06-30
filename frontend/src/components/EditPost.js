import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from "../App"

function EditPost() {

    const { httpClient } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [invalidField, setInvalidField] = useState('');
    const [invalidText, setInvalidText] = useState(null);
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // user in UserContext won't update in time in here, thus send request to api
        let user = null;
        httpClient.get('/api/user')
            .then(response => {
                user = response.data;
                if (id) {
                    return httpClient.get(`/api/post/${id}`)
                        .then(response => {
                            let currentPost = response.data;
                            setPost(response.data);
                            if (user.id !== currentPost.user.id) {
                                // user isn't the author
                                navigate('/');
                                return;
                            }
                            setIsLoading(false);
                        });
                } else {
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    // user not logged in
                    console.error(error);
                    navigate('/login');
                    return;
                } else {
                    // post not found
                    console.error(error);
                    navigate('/');
                    return;
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
            httpClient.put(`/api/post/${id}`, formData)
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
            httpClient.post('/api/post', formData)
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
            <div className="spinner-border text-primary">
                <span className="visually-hidden">Loading...</span>
            </div>
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
                                        defaultValue={post ? post.title : null} />
                                    <div className="invalid-feedback">
                                        {invalidText}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="content">Content:</label>
                                    <textarea name="content" className={`form-control ${invalidField === 'content' && 'is-invalid'}`}
                                        defaultValue={post ? post.content : null} ></textarea>
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
                                    <textarea name="tags" className="form-control" defaultValue={post ? post.tags.map(tag => tag.name).join(' ') : null}></textarea>
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