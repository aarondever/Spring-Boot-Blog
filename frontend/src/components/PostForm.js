import { useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../App"
import API from '../API';


function PostForm({ id, post }) {

    const { httpClient } = useContext(UserContext);

    const { register, setError, formState: { errors }, handleSubmit } = useForm({ defaultValues: post });
    const navigate = useNavigate();
    const postForm = useRef(null);

    const onPost = (data) => {

        if (data.image.length > 0) {

            const image = data.image[0];

            if (image.type !== 'image/jpeg' && image.type !== 'image/png') {
                // image type invalid
                setError('image', { type: 'type' });
                return;
            }

            if (image.size > 5 * 1024 * 1024) {
                // image is too large
                setError('image', { type: 'size' });
                return;
            }
        }

        const formData = new FormData(postForm.current);

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
                .catch(error => console.error(error));
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
                .catch(error => console.error(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onPost)} ref={postForm}>
            <div className="card">
                <div className="card-header">Post</div>
                <div className="card-body">
                    <div className="form-group mb-3">
                        <label htmlFor="title">Title:</label>
                        <input type="text" id="title" className={`form-control ${errors.title && "is-invalid"}`}
                            defaultValue={post.current ? post.current.title : null} {...register("title", { required: true, pattern: /^(?!\s*$).{2,}$/ })} />
                        <div className="invalid-feedback">
                            {errors.title?.type === 'required' && "Please enter title"}
                            {errors.title?.type === 'pattern' && "At least two characters and not consist of only space(s)"}
                        </div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="content">Content:</label>
                        <textarea id="content" className={`form-control ${errors.content && 'is-invalid'}`}
                            defaultValue={post.current ? post.current.content : null} {...register("content", { required: true, pattern: /^(?!\s*$).{2,}$/ })}></textarea>
                        <div className="invalid-feedback">
                            {errors.content?.type === 'required' && "Please enter content"}
                            {errors.title?.type === 'pattern' && "At least two characters and not consist of only space(s)"}
                        </div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="image">Image:</label>
                        <input type="file" id="image" className={`form-control ${errors.image && 'is-invalid'}`}
                            accept='.jpg,.jpeg,.png' {...register("image")} />
                        {!errors.image && (
                            <div className="form-text">
                                Image type: jpeg, jpg, png, Image size: &lt; 5MB
                            </div>
                        )}
                        <div className="invalid-feedback">
                            {errors.image?.type === 'type' && "Image type invalid"}
                            {errors.image?.type === 'size' && "Image size needs to be < 5MB"}
                        </div>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="tags">Tags:</label>
                        <textarea id="tags" className="form-control" defaultValue={post.current ? post.current.tags.map(tag => tag.name).join(' ') : null} {...register("tags")}></textarea>
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
    );
}

export default PostForm;