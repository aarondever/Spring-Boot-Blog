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

    public boolean insert(String title, String content, MultipartFile image, String tags) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            // user is not authenticated
            return false;
        }

        String username = authentication.getName();
        UserBean user = userMapper.findByUsername(username);

        Post post = validatePost(title, content, image);
        // set author
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

    public boolean update(int postId, String title, String content, MultipartFile image, String tags) {
        Post post = postMapper.findById(postId);
        if(post == null){
            // post does not exist
            return false;
        }
        String oldImageName = post.getImage();
        post = validatePost(title, content, image);
        post.setId(postId);
        // set current time
        Date now = new Date();
        post.setUpdatedAt(now);
        boolean result = postMapper.update(post) > 0;
        if (result) {
            // update success
            if(!oldImageName.equals("")){
                deleteImage(oldImageName);
            }
            updateTags(postId, tags);
        }
        return result;
    }

    public boolean delete(int postId) {
        Post post = postMapper.findById(postId);
        if(!post.getImage().equals("")){
            deleteImage(post.getImage());
        }
        postMapper.deletePostTagByPostId(postId);
        return postMapper.delete(postId) > 0;
    }

    private void updateTags(int postId, String tags) {
        postMapper.deletePostTagByPostId(postId);
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
    }

    private boolean validateImage(MultipartFile image) {
        if (image.isEmpty()) {
            return false;
        }

        String contentType = image.getContentType();
        if (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/gif")) {
            // invalid file type
            return false;
        }

        long size = image.getSize();
        if (size > 5 * 1024 * 1024) {
            // file is too large
            return false;
        }

        return true;
    }

    private Post validatePost(String title, String content, MultipartFile image) {
        Post post = new Post();
        post.setTitle(title.trim());
        post.setContent(content.trim());

        if (post.getTitle().length() == 0 || post.getContent().length() == 0) {
            return null;
        }

        if (validateImage(image)) {

            try {
                post.setImage(uploadImage(image));
            } catch (IOException e) {
                // image upload failed
                System.out.println(e.getMessage());
                return null;
            }
        }

        return post;
    }

    private String uploadImage(MultipartFile image) throws IOException{
        File uploadDir = new File(new ClassPathResource(".").getFile().getPath()+imageUploadDir);
        if(!uploadDir.exists()) {
            // create directory if not exists
            uploadDir.mkdirs();
        }

        String imageName = image.getOriginalFilename();
        File imageFile = new File(uploadDir, imageName);
        int i = 1;
        while (imageFile.exists()) {
            // generate a new unique file name
            imageName = i + "_" + image.getOriginalFilename();
            imageFile = new File(uploadDir, imageName);
            i++;
        }

        image.transferTo(imageFile);
        return imageName;
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
