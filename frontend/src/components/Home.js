import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { UserContext } from "../App"
import API from '../API';
import PostList from './PostList';
import TagList from './TagList';
import Loading from './Loading';

function Home() {

    const { httpClient } = useContext(UserContext);
    const [posts, setPosts] = useState(null);
    const [tags, setTags] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [tagId, setTagId] = useState(0);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isTagsLoading, setIsTagssLoading] = useState(true);

    const offcanvasCloseBtn = useRef(null);

    useEffect(() => {
        getTags();
    }, []);

    // get post list
    const getPosts = useCallback(() => {
        setPosts(null);
        httpClient.get(API.POST, { params: { search, tagId, page } })
            .then((response) => setPosts(response.data))
            .catch((error) => console.error(error));
    }, [search, tagId, page]);

    // get all tag
    const getTags = () => {
        setIsTagssLoading(true);
        httpClient.get(API.TAG)
            .then((response) => {
                setTags(response.data);
                setIsTagssLoading(false);
            })
            .catch((error) => console.error(error));
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

            <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasTags" aria-labelledby="offcanvasTagsLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasTagsLabel">Tags</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" ref={offcanvasCloseBtn}></button>
                </div>
                <div className="offcanvas-body">
                    {isTagsLoading ? (
                        <Loading />
                    ) : (
                        <TagList tags={tags} tagId={tagId} getTags={getTags} setTagId={setTagId} offcanvasCloseBtn={offcanvasCloseBtn} />
                    )}
                </div>
            </div>
            <div className="row">
                <div className="col-md-3 col-lg-2 d-none d-md-block">
                    <div className="d-flex flex-column flex-shrink-0 p-3">
                        <p className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-body-emphasis"><span className="fs-4">Tags:</span></p>
                        <hr />
                        {isTagsLoading ? (
                            <Loading />
                        ) : (
                            <TagList tags={tags} tagId={tagId} getTags={getTags} setTagId={setTagId} offcanvasCloseBtn={offcanvasCloseBtn} />
                        )}
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="row mb-3 justify-content-md-center justify-content-between">
                        <div className='col-2 d-md-none'>
                            <button className="btn btn-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTags" aria-controls="offcanvasTags">
                                Tags
                            </button>
                        </div>
                        <div className="col-10">
                            <form onSubmit={handleSearchSubmit}>
                                <div className="input-group rounded">
                                    <span class="input-group-text">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search"
                                            viewBox="0 0 16 16">
                                            <path
                                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                        </svg>
                                    </span>
                                    <input type="search" className="form-control" placeholder="Search title or content" name="search" />
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