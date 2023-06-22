package com.project.blog.pojo;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class Post {

    private int id;
    private String title;
    private String content;
    private String image;
    private Date createdAt;
    private Date updatedAt;
    private UserBean user;
    private List<Tag> tags;

}

