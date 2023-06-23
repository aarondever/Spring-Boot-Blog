package com.project.blog.controller;

import com.github.pagehelper.PageInfo;
import com.project.blog.pojo.Post;
import com.project.blog.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/post")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<PageInfo<Post>> getPosts(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int tagId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "4") int pageSize) {
        PageInfo<Post> posts = postService.getPosts(search, tagId, page, pageSize);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable int id) {
        Post post = postService.getPostById(id);
        return post != null ? ResponseEntity.ok(post) : ResponseEntity.notFound().build();
    }

    /**
     * insert post to database
     *
     * @param title   post title
     * @param content post content
     * @param image   post image
     * @param tags    post tags
     * @return success: http 201
     * 1: title or content invalid: http 400
     * 2: image type invalid: http 400
     * 3: image size too large: http 400
     */
    @PostMapping
    public ResponseEntity<Integer> insertPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("image") MultipartFile image,
            @RequestParam("tags") String tags
    ) {
        int postInsertStatus = postService.insert(title, content, image, tags);
        if (postInsertStatus == 0) {
            // insert success
            return ResponseEntity.created(null).build();
        } else {
            // request data invalid
            return ResponseEntity.badRequest().body(postInsertStatus);
        }
    }

    /**
     * update post to database
     *
     * @param title   post title
     * @param content post content
     * @param image   post image
     * @param tags    post tags
     * @return success: http 204
     * 1: title or content invalid: http 400
     * 2: image type invalid: http 400
     * 3: image size too large: http 400
     * post not found: http 404
     */
    @PutMapping("/{id}")
    public ResponseEntity<Integer> updatePost(
            @PathVariable int id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("image") MultipartFile image,
            @RequestParam("tags") String tags) {
        int postUpdateStatus = postService.update(id, title, content, image, tags);
        if (postUpdateStatus == 0) {
            // update success
            return ResponseEntity.noContent().build();
        } else if (postUpdateStatus == 4) {
            // post not found
            return ResponseEntity.notFound().build();
        } else {
            // request data invalid
            return ResponseEntity.badRequest().body(postUpdateStatus);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable int id) {
        if (postService.delete(id)) {
            // delete success
            return ResponseEntity.noContent().build();
        } else {
            // failed to delete
            return ResponseEntity.notFound().build();
        }
    }
}
