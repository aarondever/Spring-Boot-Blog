import { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from "../App"
import Loading from './Loading';
import API from '../API';
import PostList from './PostList';

function Home() {

    const { httpClient } = useContext(UserContext);
    const [posts, setPosts] = useState(null);
    const [tags, setTags] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [tagId, setTagId] = useState(0);

    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        getTags();
    }, []);

    // get post list
    const getPosts = useCallback(async () => {
        setPosts(null);
        try {
            const response = await httpClient.get(API.POST, {
                params: { search, tagId, page }
            });
            setPosts(response.data);
        } catch (error) {
            console.error(error);
        }
    }, [search, tagId, page]);

    // get all tag
    const getTags = async () => {
        setTags(null);
        try {
            const response = await httpClient.get(API.TAG);
            setTags(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // delete post
    const deletePost = (id) => {
        httpClient.delete(`${API.POST}/${id}`)
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
                        <p className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-body-emphasis"><span className="fs-4">Tags:</span></p>
                        <hr />
                        <ul className="nav nav-pills flex-column mb-auto">
                            <li className="nav-item">
                                <button className={`w-100 nav-link link-body-emphasis ${0 === tagId ? 'active' : ''}`} onClick={() => setTagId(0)}>
                                    No tag
                                </button>
                            </li>
                            {tags ? tags.map(tag => (
                                <li key={tag.id} className="nav-item">
                                    <button className={`w-100 nav-link link-body-emphasis ${tag.id === tagId ? 'active' : ''}`} onClick={() => setTagId(tag.id)}>
                                        {tag.name}
                                    </button>
                                </li>
                            )) : (
                                <Loading />
                            )}
                        </ul>
                    </div>
                </div>
                <div className="col-sm-8">
                    <div className="row m-3 justify-content-center">
                        <div className="col-md-4">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="input-group rounded">
                                    <input type="search" className="form-control" placeholder="search title or content" name="search" />
                                    <button type="submit" className="btn btn-outline-primary">Search</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <PostList getPosts={getPosts} posts={posts} setSelectedPost={setSelectedPost} />
                    {posts && posts.list.length !== 0 && (
                        <div className="row mt-2">
                            <div className="col">
                                <nav>
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${posts.hasPreviousPage ? 'active' : 'disabled'}`}>
                                            <button className="page-link" onClick={() => setPage(posts.prePage)}>
                                                <span aria-hidden="true">&laquo;</span>
                                            </button>
                                        </li>
                                        {Array.from({ length: posts.pages }, (_, i) => i + 1).map(i => (
                                            <li key={i} className={`page-item ${posts.pageNum === i ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(i)}>{i}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${posts.hasNextPage ? 'active' : 'disabled'}`}>
                                            <button className="page-link" onClick={() => setPage(posts.nextPage)}>
                                                <span aria-hidden="true">&raquo;</span>
                                            </button>
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
                            <h5 className="modal-title">Delete Post</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-truncate">Are you sure you wanna delete '{selectedPost && selectedPost.title}'?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => deletePost(selectedPost && selectedPost.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;