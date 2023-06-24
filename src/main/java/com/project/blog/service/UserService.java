package com.project.blog.service;

import com.project.blog.mapper.UserMapper;
import com.project.blog.pojo.UserBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserMapper userMapper, BCryptPasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserBean findById(int id) {
        return userMapper.findById(id);
    }

    public UserBean findByUsername(String username)  {
        return userMapper.findByUsername(username);
    }

    public boolean signUp(UserBean user) {
        UserBean storedUser = userMapper.findByUsername(user.getUsername());
        if (storedUser != null) {
            // username already exists
            return false;
        }
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        userMapper.insert(user);
        return true;
    }

}
