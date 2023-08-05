package com.project.blog.controller;

import com.github.pagehelper.PageInfo;
import com.project.blog.annotation.ValidatePost;
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

    @ValidatePost(data = false)
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable int id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    /**
     * insert post to database
     *
     * @param title   post title
     * @param content post content
     * @param image   post image
     * @param tags    post tags
     * @return success: http 201
     * request data: http 400
     */
    @ValidatePost(id = false)
    @PostMapping
    public ResponseEntity<?> insertPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("image") MultipartFile image,
            @RequestParam("tags") String tags
    ) {
        if (postService.insertPost(title, content, image, tags)) {
            // insert success
            return ResponseEntity.created(null).build();
        }
        // insert failed
        return ResponseEntity.internalServerError().build();
    }

    /**
     * update post to database
     *
     * @param title   post title
     * @param content post content
     * @param image   post image
     * @param tags    post tags
     * @return success: http 204
     * request data invalid: http 400
     * post not found: http 404
     */
    @ValidatePost
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable int id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("image") MultipartFile image,
            @RequestParam("tags") String tags) {
        if (postService.updatePost(id, title, content, image, tags)) {
            // update success
            return ResponseEntity.noContent().build();
        }
        // update failed
        return ResponseEntity.internalServerError().build();
    }

    @ValidatePost(data = false)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable int id) {
        if (postService.deletePost(id)) {
            // delete success
            return ResponseEntity.noContent().build();
        } else {
            // delete failed
            return ResponseEntity.internalServerError().build();
        }
    }

}
