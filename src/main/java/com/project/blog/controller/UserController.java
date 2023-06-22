package com.project.blog.controller;

import com.project.blog.pojo.UserBean;
import com.project.blog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserBean user) {
        if (userService.signUp(user)){
            // sign up success
            return ResponseEntity.created(null).build();
        }
        // username already exists
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @GetMapping("/user")
    public ResponseEntity<UserBean> getUser(Authentication authentication) {
        if (authentication == null) {
            // user is not authenticated
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // get the current user's username from the Authentication object
        String username = authentication.getName();
        UserBean user = userService.findByUsername(username);
        if (user == null) {
            // user not found in the database
            return ResponseEntity.notFound().build();
        }
        user.setPassword(""); // not letting frontend see the hashed password
        return ResponseEntity.ok(user);
    }

}