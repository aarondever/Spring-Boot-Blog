import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from "../App"
import Loading from './Loading';
import API from '../API';

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function PostList({ getPosts, posts, setSelectedPost }) {

    const { user } = useContext(UserContext);

    useEffect(() => {
        getPosts();
    }, [getPosts]);

    return (
        <div className="row g-5">
            {posts ? posts.list.map(post => (
                <div key={post.id} className="col-lg-6">
                    <div className="card" style={{ minHeight: "20rem" }}>
                        <div className="row g-0 position-relative">
                            <div className="col-lg-4">
                                {post.image && (
                                    <img className="d-block mx-auto img-fluid object-fit-scale" src={`${API.FILES}/${post.image}`} alt="thumbnail" style={{ width: "200px", height: "250px" }} />
                                )}
                            </div>
                            <div className="col-lg-8">
                                <div className="card-body">
                                    <h3 className="card-title text-truncate">
                                        <Link to={`/viewPost/${post.id}`} className="link-underline link-underline-opacity-0 link-underline-opacity-75-hover stretched-link">
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="card-text text-truncate">
                                        {post.content}
                                    </p>
                                    <p className="card-text"><small className="text-body-secondary">Author: {post.user.username}</small></p>
                                    <p className="card-text"><small className="text-body-secondary">Posted at: {formatDate(post.createdAt)}</small></p>
                                    <p className="card-text"><small className="text-body-secondary">Last update: {formatDate(post.updatedAt)}</small></p>
                                    <p className="card-text text-truncate"><small className="text-body-secondary">{post.tags.length === 0 ? '#' : post.tags.map(tag => `#${tag.name}`).join(' ')}</small></p>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer gap-5 d-flex justify-content-center bg-transparent">
                            {user && user.id === post.user.id && (
                                // login user is the author
                                <>
                                    <Link to={`/editPost/${post.id}`} className="btn btn-primary">Edit</Link>
                                    <button type="button" name="btnDelete" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal" onClick={() => setSelectedPost(post)}>Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )) : (
                <Loading />
            )}
        </div>
    );
}

export default PostList;