package com.project.blog.service;

import com.project.blog.mapper.UserMapper;
import com.project.blog.pojo.UserBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    @Autowired
    public CustomUserDetailsService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserBean user = userMapper.findByUsername(username);
        if (user == null) {
            // username not found
            throw new UsernameNotFoundException(username);
        }
        return new User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }

}
