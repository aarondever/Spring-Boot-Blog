package com.project.blog.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Aspect
@Component
public class PostControllerLoggingAspect {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Pointcut("execution(* com.project.blog.controller.PostController.insertPost(..)) || " +
            "execution(* com.project.blog.controller.PostController.updatePost(..)) || " +
            "execution(* com.project.blog.controller.PostController.deletePost(..))")
    public void postControllerMethods() {}

    @Before("postControllerMethods()")
    public void logBefore(JoinPoint joinPoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        if(methodName.equals("insertPost")){
            // creating post
            logger.info("user[{}] is creating post with arguments [title='{}', content='{}', image='{}', tags='{}']",
                    username, args[0], args[1], ((MultipartFile)args[2]).getOriginalFilename(), args[3]);
        }else if(methodName.equals("updatePost")){
            // updating post
            logger.info("user[{}] is updating post with arguments [id={}, title='{}', content='{}', image='{}', tags='{}']",
                    username, args[0], args[1], args[2], ((MultipartFile)args[3]).getOriginalFilename(), args[4]);
        }else{
            // deleting post
            logger.info("user[{}] is deleting post with arguments [id={}]",
                    username, args[0]);
        }
    }

    @AfterReturning(pointcut = "postControllerMethods()", returning = "result")
    public void logAfter(JoinPoint joinPoint, Object result) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        String methodName = joinPoint.getSignature().getName();
        logger.info("user[{}] has executed {} with result {}", username, methodName, result);
    }
}
