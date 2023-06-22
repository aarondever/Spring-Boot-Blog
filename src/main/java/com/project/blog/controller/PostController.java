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

    @PostMapping
    public ResponseEntity<?> insertPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("image") MultipartFile image,
            @RequestParam("tags") String tags
    ) {
        if (postService.insert(title, content, image, tags)) {
            // insert success
            return ResponseEntity.noContent().build();
        }else {
            // failed to insert
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable int id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("image") MultipartFile image,
            @RequestParam("tags") String tags) {
        if (postService.update(id, title, content, image, tags)) {
            // update success
            return ResponseEntity.noContent().build();
        }else {
            // failed to update
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable int id) {
        if (postService.delete(id)) {
            // delete success
            return ResponseEntity.noContent().build();
        }else {
            // failed to delete
            return ResponseEntity.notFound().build();
        }
    }
}
