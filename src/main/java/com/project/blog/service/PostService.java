package com.project.blog.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.project.blog.mapper.PostMapper;
import com.project.blog.mapper.TagMapper;
import com.project.blog.mapper.UserMapper;
import com.project.blog.pojo.Post;
import com.project.blog.pojo.Tag;
import com.project.blog.pojo.UserBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class PostService {

    private final PostMapper postMapper;
    private final TagMapper tagMapper;
    private final UserMapper userMapper;

    private final StorageService storageService;

    @Autowired
    public PostService(PostMapper postMapper, TagMapper tagMapper, UserMapper userMapper, StorageService storageService) {
        this.postMapper = postMapper;
        this.tagMapper = tagMapper;
        this.userMapper = userMapper;
        this.storageService = storageService;
    }

    public PageInfo<Post> getPosts(String search, int tagId, int page, int pageSize) {
        PageHelper.startPage(page, pageSize);
        List<Post> posts = postMapper.findAll(search, tagId);
        return new PageInfo<>(posts);
    }

    public Post getPostById(int postId) {
        return postMapper.findById(postId);
    }

    public boolean insertPost(String title, String content, MultipartFile image, String tags) {
        Post post = new Post();
        post.setTitle(title.trim());
        post.setContent(content.trim());

        if (!image.isEmpty()) {
            // image isn't empty
            post.setImage(uploadImage(image));
        }

        // set author
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserBean user = userMapper.findByUsername(username);
        post.setUser(user);
        // set current time
        Date now = new Date();
        post.setCreatedAt(now);
        post.setUpdatedAt(now);
        boolean result = postMapper.insert(post) > 0;
        if (result) {
            // insert success
            updateTags(post.getId(), tags);
        }
        return result;
    }

    public boolean updatePost(int postId, String title, String content, MultipartFile image, String tags) {
        Post post = postMapper.findById(postId);
        post.setTitle(title.trim());
        post.setContent(content.trim());

        String oldImageName = post.getImage();
        if (!image.isEmpty()) {
            post.setImage(uploadImage(image));

            if (oldImageName != null && !oldImageName.equals("")) {
                deleteImage(oldImageName);
            }
        }

        // set current time
        Date now = new Date();
        post.setUpdatedAt(now);
        boolean result = postMapper.update(post) > 0;
        if (result) {
            // update success
            updateTags(postId, tags);
        }
        return result;
    }

    public boolean deletePost(int postId) {
        Post post = postMapper.findById(postId);
        if (post.getImage() != null && !post.getImage().equals("")) {
            deleteImage(post.getImage());
        }
        deleteTagByTagIds(deletePostTag(postId));
        return postMapper.delete(postId) > 0;
    }

    private void updateTags(int postId, String tags) {
        List<Integer> deletedTagIds = deletePostTag(postId);

        String[] tagNames = tags.trim().toLowerCase().split(" ");
        Set<String> tagNameSet = new HashSet<>(Arrays.asList(tagNames)); // remove duplicate; time complexity: O(n)
//        tagNames = Arrays.stream(tagNames).distinct().toArray(String[]::new); time complexity: O(n log(n))
        for (String tagName : tagNameSet) {
            if(tagName.equals(""))
                // eliminate empty string
                continue;
            Tag tag = tagMapper.findByName(tagName);
            if (tag != null) {
                // tag exists, insert to post_tag
                postMapper.insertPostTag(postId, tag.getId());
            } else {
                // tag doesn't exist, create it
                Tag newTag = new Tag();
                newTag.setName(tagName);
                tagMapper.insert(newTag);
                postMapper.insertPostTag(postId, newTag.getId());
            }
        }

        deleteTagByTagIds(deletedTagIds);
    }

    private List<Integer> deletePostTag(int postId) {
        List<Integer> deletedTagIds = postMapper.findPostTagIdsByPostId(postId);
        postMapper.deletePostTagByPostId(postId);
        return deletedTagIds;
    }

    private void deleteTagByTagIds(List<Integer> tagIds) {
        for (int tagId : tagIds) {
            if (postMapper.getPostTagCountByTagId(tagId) == 0) {
                // the tag isn't associated with any post, delete it
                tagMapper.delete(tagId);
            }
        }
    }

    private String uploadImage(MultipartFile image) {
        return storageService.store(image);
    }

    private void deleteImage(String imageName) {
        storageService.delete(imageName);
    }

}
