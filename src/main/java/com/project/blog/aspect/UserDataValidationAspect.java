package com.project.blog.aspect;

import com.project.blog.annotation.ValidateUser;
import com.project.blog.pojo.UserBean;
import com.project.blog.service.UserService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class UserDataValidationAspect {

    private final UserService userService;

    @Autowired
    public UserDataValidationAspect(UserService userService) {
        this.userService = userService;
    }

    @Around("@annotation(validateUser)")
    public Object validateUser(ProceedingJoinPoint joinPoint, ValidateUser validateUser) throws Throwable {
        UserBean user = (UserBean) joinPoint.getArgs()[0];
        if (validateUser.id()) {
            // check user existence
            if (userService.getUserById(user.getId()) == null) {
                // user does not exists
                return ResponseEntity.notFound().build();
            }
        }

        if (validateUser.username()) {
            // validate username
            String username = user.getUsername().trim();
            if (username.length() == 0) {
                // empty username
                return ResponseEntity.badRequest().build();
            }
        }

        if (validateUser.password()) {
            // validate password
            String password = user.getPassword().trim();
            if (password.length() == 0) {
                // empty password
                return ResponseEntity.badRequest().build();
            }
        }

        // no validation
        return joinPoint.proceed();
    }

}
