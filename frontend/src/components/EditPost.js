import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from "../App"

function EditPost() {

    const { httpClient } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [submitStatus, setSubmitStatus] = useState(0);
    const [titleInvalidText, setTitleInvalidText] = useState(null);
    const [contentInvalidText, setContentInvalidText] = useState(null);
    const [imageInvalidText, setImageInvalidText] = useState(null);

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
                        });
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
        setIsLoading(false);
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();

        if (title.length === 0) {
            setSubmitStatus(1);
            setTitleInvalidText('标题不能为空');
            return;
        }

        if (content.length === 0) {
            setSubmitStatus(2);
            setContentInvalidText('内容不能为空');
            return;
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

    function invalidImage(error){
        setSubmitStatus(3);
        if(error.response.data === 2){
            // image type invalid
            setImageInvalidText("图片格式不正确");
        }else if (error.response.data === 3) {
            // image too big
            setImageInvalidText("图片超出5MB");
        } else{
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
                            <div className="card-header">文章</div>

                            <div className="card-body">
                                <div className="form-group mb-3">
                                    <label htmlFor="title">标题:</label>
                                    <input type="text" name="title" className={`form-control ${submitStatus === 1 ? 'is-invalid' : ''}`}
                                     defaultValue={post ? post.title : null} />
                                    <div className="invalid-feedback">
                                        {titleInvalidText}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="content">内容:</label>
                                    <textarea name="content" className={`form-control ${submitStatus === 2 ? 'is-invalid' : ''}`}
                                     defaultValue={post ? post.content : null} ></textarea>
                                    <div className="invalid-feedback">
                                        {contentInvalidText}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="image">图片:</label>
                                    <input type="file" name="image" className={`form-control ${submitStatus === 3 ? 'is-invalid' : ''}`}
                                     accept='.jpg,.jpeg,.png' />
                                    {submitStatus !== 3 && (
                                        <div className="form-text">
                                            图片格式: jpeg, jpg 和 png, 图片大小: &lt; 5MB
                                        </div>
                                    )}
                                    <div className="invalid-feedback">
                                        {imageInvalidText}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="tags">标签:</label>
                                    <textarea name="tags" className="form-control" defaultValue={post ? post.tags.map(tag => tag.name).join(' ') : null}></textarea>
                                    <div className="form-text">
                                        标签之间用空格分隔, 例如: python java
                                    </div>
                                </div>

                                <button type="submit" name="btnPost" className="btn btn-primary">
                                    {id ? '更新' : '发布'}
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