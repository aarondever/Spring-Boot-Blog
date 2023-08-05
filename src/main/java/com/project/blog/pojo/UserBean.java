package com.project.blog.pojo;

import lombok.Data;

@Data
public class UserBean  {

    private int id;
    private String username;
    private String password;
    private String currentPassword;

}
