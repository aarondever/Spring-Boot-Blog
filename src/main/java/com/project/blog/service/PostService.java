package com.project.blog.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.project.blog.mapper.PostMapper;
import com.project.blog.mapper.TagMapper;
import com.project.blog.mapper.UserMapper;
import com.project.blog.pojo.Post;
import com.project.blog.pojo.Tag;
import com.project.blog.pojo.UserBean;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class PostService {

    private final PostMapper postMapper;
    private final TagMapper tagMapper;
    private final UserMapper userMapper;

    @Value("${image.upload-dir}")
    private String imageUploadDir;

    @Autowired
    public PostService(PostMapper postMapper, TagMapper tagMapper, UserMapper userMapper) {
        this.postMapper = postMapper;
        this.tagMapper = tagMapper;
        this.userMapper = userMapper;
    }

    public PageInfo<Post> getPosts(String search, int tagId, int page, int pageSize) {
        PageHelper.startPage(page, pageSize);
        List<Post> posts = postMapper.findAll(search, tagId);
        return new PageInfo<>(posts);
    }

    public Post getPostById(int postId) {
        return postMapper.findById(postId);
    }

    public int insert(String title, String content, MultipartFile image, String tags) {
        Post post = new Post();
        post.setTitle(title.trim());
        post.setContent(content.trim());
        if(!isPostValidated(post)){
            // title or content invalid
            return 1;
        }

        if (!image.isEmpty()) {
            // image isn't empty
            int imageValidation = validateImage(image);
            if(imageValidation != 0){
                // image invalid
                return imageValidation;
            }else {
                post.setImage(uploadImage(image));
            }
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
        return 0;
    }

    public int update(int postId, String title, String content, MultipartFile image, String tags) {
        Post post = postMapper.findById(postId);
        if(post == null){
            // post does not exist
            return 4;
        }

        post.setTitle(title.trim());
        post.setContent(content.trim());
        if(!isPostValidated(post)){
            // title or content invalid
            return 1;
        }

        String oldImageName = post.getImage();
        if (!image.isEmpty()) {
            // image isn't empty
            int imageValidation = validateImage(image);
            if(imageValidation != 0){
                // image invalid
                return imageValidation;
            }else {
                post.setImage(uploadImage(image));
            }

            if(oldImageName != null && !oldImageName.equals("")){
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
        return 0;
    }

    public boolean delete(int postId) {
        Post post = postMapper.findById(postId);
        if(post.getImage() != null && !post.getImage().equals("")){
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

    private List<Integer> deletePostTag(int postId){
        List<Integer> deletedTagIds = postMapper.findPostTagIdsByPostId(postId);
        postMapper.deletePostTagByPostId(postId);
        return deletedTagIds;
    }

    private void deleteTagByTagIds(List<Integer> tagIds){
        for(int tagId : tagIds){
            if(postMapper.getPostTagCountByTagId(tagId) == 0){
                // the tag isn't associated with any post, delete it
                tagMapper.delete(tagId);
            }
        }
    }

    private int validateImage(MultipartFile image) {
        String contentType = image.getContentType();
        if (!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
            // invalid file type
            return 2;
        }
        long size = image.getSize();
        if (size > 5 * 1024 * 1024) {
            // file is too large
            return 3;
        }
        return 0;
    }

    private boolean isPostValidated(Post post) {
        return post.getTitle().length() != 0 && post.getContent().length() != 0;
    }

    private String uploadImage(MultipartFile image){
        File uploadDir = null;
        try {
            uploadDir = new File(new ClassPathResource(".").getFile().getPath()+imageUploadDir);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        if(!uploadDir.exists()) {
            // create directory if not exists
            uploadDir.mkdirs();
        }

        String imageName = image.getOriginalFilename();
        String ext = FilenameUtils.getExtension(imageName);
        String uniqueName = UUID.randomUUID() + "." + ext;
        File imageFile = new File(uploadDir, uniqueName);

        try {
            image.transferTo(imageFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return uniqueName;
    }

    private void deleteImage(String imageName) {
        File uploadDir;
        try {
            uploadDir = new File(new ClassPathResource(".").getFile().getPath() + imageUploadDir);
        } catch (IOException e) {
            return;
        }

        if (!uploadDir.exists()) {
            // directory not exists
            return;
        }

        File imageFile = new File(uploadDir, imageName);
        if (imageFile.exists()) {
            // image exists, delete it
            imageFile.delete();
        }
    }

}
