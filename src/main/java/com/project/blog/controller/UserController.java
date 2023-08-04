package com.project.blog.controller;

import com.project.blog.annotation.ValidateUser;
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

    @ValidateUser(id = false)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserBean user) {
        if (userService.insertUser(user)) {
            // sign up success
            return ResponseEntity.created(null).build();
        }
        // username already exists
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @ValidateUser(password = false)
    @PutMapping("/user/username")
    public ResponseEntity<?> updateUsername(@RequestBody UserBean user) {
        return userService.updateUsername(user) ?
                ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @ValidateUser(username = false)
    @PutMapping("/user/password")
    public ResponseEntity<?> updatePassword(@RequestBody UserBean user) {
        int updateStatus = userService.updatePassword(user);
        if (updateStatus == 1) {
            // old password incorrect
            return ResponseEntity.notFound().build();
        } else if (updateStatus == 2) {
            // new password same with old password
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } else if (updateStatus == -1) {
            // update failed
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user")
    public ResponseEntity<UserBean> getUser(Authentication authentication) {
        if (authentication == null) {
            // user is not authenticated
            return ResponseEntity.ok(null);
        }
        // get the current user's username from the Authentication object
        String username = authentication.getName();
        UserBean user = userService.getUserByUsername(username);
        if (user == null) {
            // user not found
            return ResponseEntity.notFound().build();
        }
        user.setPassword(""); // remove hashed password
        return ResponseEntity.ok(user);
    }

    @GetMapping("/session-expired")
    public ResponseEntity<Boolean> isSessionExpired(Authentication authentication) {
        // if the authentication object is null, the session is expired
        return ResponseEntity.ok(authentication == null);
    }

}