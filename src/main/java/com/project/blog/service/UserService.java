package com.project.blog.service;

import com.project.blog.mapper.UserMapper;
import com.project.blog.pojo.UserBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
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

    public UserBean getUserById(int id) {
        return userMapper.findById(id);
    }

    public UserBean getUserByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    public boolean insertUser(UserBean user) {
        user.setUsername(user.getUsername().trim());
        user.setPassword(user.getPassword().trim());
        if (isUsernameExists(user.getUsername())) {
            // username already exists
            return false;
        }
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        userMapper.insert(user);
        return true;
    }

    public boolean updateUsername(UserBean user) {
        user.setUsername(user.getUsername().trim());
        if (isUsernameExists(user.getUsername())) {
            // username already exists
            return false;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User userDetail = (User) authentication.getPrincipal();

        // create a new User object with the updated username
        User newUserDetail = new User(user.getUsername(), "", userDetail.getAuthorities());

        // create a new authentication token with the new User object
        Authentication newAuthentication = new UsernamePasswordAuthenticationToken(newUserDetail, null, newUserDetail.getAuthorities());

        // set the new authentication token in the SecurityContext
        SecurityContextHolder.getContext().setAuthentication(newAuthentication);

        return userMapper.updateUsername(user) > 0;
    }

    public int updatePassword(UserBean user) {
        user.setPassword(user.getPassword().trim());
        user.setCurrentPassword(user.getCurrentPassword().trim());
        UserBean storedUser = userMapper.findById(user.getId());
        if (!passwordEncoder.matches(user.getCurrentPassword(), storedUser.getPassword())) {
            // current password is incorrect
            return 1;
        }
        if (passwordEncoder.matches(user.getPassword(), storedUser.getPassword())) {
            // new password matching current password
            return 2;
        }
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userMapper.updatePassword(user) > 0 ? 0 : -1;
    }

    private boolean isUsernameExists(String username) {
        return userMapper.findByUsername(username) != null;
    }

}
