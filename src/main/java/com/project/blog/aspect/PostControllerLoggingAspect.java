package com.project.blog.aspect;

import com.project.blog.pojo.Post;
import com.project.blog.pojo.UserBean;
import com.project.blog.service.UserService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Aspect
@Component
public class PostControllerLoggingAspect {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private static final ThreadLocal<UserBean> userThreadLocal = new ThreadLocal<>();  // thread safe
    private final UserService userService;

    @Autowired
    public PostControllerLoggingAspect(UserService userService) {
        this.userService = userService;
    }

    @Pointcut("execution(* com.project.blog.controller.PostController.insertPost(..)) || " +
            "execution(* com.project.blog.controller.PostController.updatePost(..)) || " +
            "execution(* com.project.blog.controller.PostController.deletePost(..))")
    public void postControllerMethods() { }

    @Before("postControllerMethods()")
    public void logBefore(JoinPoint joinPoint) {
        UserBean user = getUser();
        userThreadLocal.set(user);

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String methodName = signature.getName();
        String[] parameterNames = signature.getParameterNames();
        Object[] parameterValues = joinPoint.getArgs();
        Post post = new Post();
        MultipartFile image = null;
        String tags = "";

        for (int i = 0; i < parameterNames.length; i++) {
            switch (parameterNames[i]) {
                case "id" -> post.setId((Integer) parameterValues[i]);
                case "title" -> post.setTitle(parameterValues[i].toString());
                case "content" -> post.setContent(parameterValues[i].toString());
                case "image" -> image = (MultipartFile) parameterValues[i];
                case "tags" -> tags = parameterValues[i].toString();
            }
        }

        if (methodName.equals("insertPost")) {
            // creating post
            logger.info("user[id={}, username='{}'] is creating post with arguments [title='{}', content='{}', image='{}', tags='{}']",
                    user.getId(), user.getUsername(), post.getTitle(), post.getContent(), image.getOriginalFilename(), tags);
        } else if (methodName.equals("updatePost")) {
            // updating post
            logger.info("user[id={}, username='{}'] is updating post with arguments [id={}, title='{}', content='{}', image='{}', tags='{}']",
                    user.getId(), user.getUsername(), post.getId(), post.getTitle(), post.getContent(), image.getOriginalFilename(), tags);
        } else {
            // deleting post
            logger.info("user[id={}, username='{}'] is deleting post with arguments [id={}]",
                    user.getId(), user.getUsername(), post.getId());
        }
    }

    @AfterReturning(pointcut = "postControllerMethods()", returning = "result")
    public void logAfter(JoinPoint joinPoint, Object result) {
        UserBean user = userThreadLocal.get();

        String methodName = joinPoint.getSignature().getName();
        logger.info("user[id={}, username='{}'] has executed {} with result {}", user.getId(), user.getUsername(), methodName, result);

        userThreadLocal.remove();
    }

    private UserBean getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userService.getUserByUsername(username);
    }

}
