import { useState, useContext, useCallback, useEffect } from 'react';
import { UserContext } from "../App"

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function Home() {

    const { user, httpClient } = useContext(UserContext);
    const [posts, setPosts] = useState(null);
    const [tags, setTags] = useState([]);
    const [search, setSearch] = useState("");
    const [tagId, setTagId] = useState(0);
    const [page, setPage] = useState(1);
    const[selectedPost, setSelectedPost]  = useState({ id: 0, title: '' });

    useEffect(() => {
        getPosts();
        getTags();
    }, []);

    // get post list
    const getPosts = useCallback(() => {
        httpClient.get('/api/post', {
            params: { search, tagId, page }
        })
            .then(response => setPosts(response.data))
            .catch(error => console.error(error));
    }, [search, tagId, page]);

    // get all tag
    const getTags = () => {
        httpClient.get('/api/tag')
            .then(response => setTags(response.data))
            .catch(error => console.error(error));
    };

    // delete post
    const deletePost = async (id) => {
        await httpClient.delete(`/api/post/${id}`)
            .then(() => {
                getPosts();
                getTags();
            })
            .catch(error => console.error(error));
    }

    // handle search bar submit
    const handleSearchSubmit = event => {
        event.preventDefault();
        const searchInput = event.target.elements.search;
        setSearch(searchInput.value);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-3 col-md-2">
                    <div className="d-flex flex-column flex-shrink-0 p-3" style={{ width: "280px" }}>
                        <p className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-body-emphasis"><span className="fs-4">标签:</span></p>
                        <hr />
                        <ul className="nav nav-pills flex-column mb-auto">
                            {tags.map(tag => (
                                <li key={tag.id} className="nav-item">
                                    <a href="#" className={`nav-link link-body-emphasis ${tag.id === tagId ? 'active' : ''}`} onClick={() => setTagId(tag.id)}>
                                        {tag.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-sm-8">
                    <div className="row m-3 justify-content-center">
                        <div className="col-md-4">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="input-group rounded">
                                    <input type="search" className="form-control" placeholder="搜索" name="search" />
                                    <button type="submit" className="btn btn-outline-primary">搜索</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {posts ? posts.list.map(post => (
                            <div key={post.id} className="col">
                                <div className="card" style={{ height: "20rem" }}>
                                    <div className="row g-0 position-relative">
                                        <div className="col-md-4">
                                            {post.image && (
                                                <img className="d-block mx-auto img-fluid object-fit-scale" src={`./images/${post.image}`} alt="thumbnail" style={{ width: "200px", height: "250px" }} />
                                            )}
                                        </div>
                                        <div className="col-md-8">
                                            <div className="card-body">
                                                <h3 className="card-title text-truncate">
                                                    <a href={`/viewPost/${post.id}`} className="link-underline link-underline-opacity-0 link-underline-opacity-75-hover stretched-link">
                                                        {post.title}
                                                    </a>
                                                </h3>
                                                <p className="card-text text-truncate">
                                                    {post.content}
                                                </p>
                                                <p className="card-text"><small className="text-body-secondary">作者: {post.user.username}</small></p>
                                                <p className="card-text"><small className="text-body-secondary">创建于: {formatDate(post.createdAt)}</small></p>
                                                <p className="card-text"><small className="text-body-secondary">最近更新: {formatDate(post.updatedAt)}</small></p>
                                                <p className="card-text text-truncate"><small className="text-body-secondary">{post.tags.map(tag => `#${tag.name}`).join(' ')}</small></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row justify-content-center">
                                        {user && user.id === post.user.id && (
                                            // login user is the author
                                            <div className="col-md-4">
                                                <a href={`/editPost/${post.id}`} className="btn btn-primary me-2">编辑</a>
                                                <button type="button" name="btnDelete" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal" onClick={() => setSelectedPost(post)}>删除</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="spinner-border text-primary">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}
                    </div>
                    {posts && posts.list.length !== 0 && (
                        <div className="row mt-2">
                            <div className="col">
                                <nav>
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${posts.hasPreviousPage ? 'active' : 'disabled'}`}>
                                            <a className="page-link" href="#" onClick={() => setPage(posts.prePage)}>
                                                <span aria-hidden="true">&laquo;</span>
                                            </a>
                                        </li>
                                        {Array.from({ length: posts.pages }, (_, i) => i + 1).map(i => (
                                            <li key={i} className={`page-item ${posts.pageNum === i ? 'active' : ''}`}>
                                                <a className="page-link" href="#" onClick={() => setPage(i)}>{i}</a>
                                            </li>
                                        ))}
                                        <li className={`page-item ${posts.hasNextPage ? 'active' : 'disabled'}`}>
                                            <a className="page-link" href="#" onClick={() => setPage(posts.nextPage)}>
                                                <span aria-hidden="true">&raquo;</span>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="modal fade" id="deletePostModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">删除文章</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-truncate">确定要删除{selectedPost.title}?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => deletePost(selectedPost.id)}>删除</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;