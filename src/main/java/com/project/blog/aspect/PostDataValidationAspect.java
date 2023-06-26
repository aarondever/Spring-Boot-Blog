package com.project.blog.aspect;

import com.project.blog.annotation.ValidatePost;
import com.project.blog.service.PostService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Aspect
@Component
public class PostDataValidationAspect {

    private final PostService postService;

    @Autowired
    public PostDataValidationAspect(PostService postService) {
        this.postService = postService;
    }

    @Around("@annotation(validatePost)")
    public Object validatePost(ProceedingJoinPoint joinPoint, ValidatePost validatePost) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] parameterValues = joinPoint.getArgs();
        int postId = 0;
        String title = "", content = "";
        MultipartFile image = null;
        for (int i = 0; i < parameterNames.length; i++) {
            switch (parameterNames[i]) {
                case "id" -> postId = (int) parameterValues[i];
                case "title" -> title = parameterValues[i].toString().trim();
                case "content" -> content = parameterValues[i].toString().trim();
                case "image" -> image = (MultipartFile) parameterValues[i];
            }
        }

        if (validatePost.id() && postService.getPostById(postId) == null) {
            // post does not exist
            return ResponseEntity.notFound().build();
        }

        if (validatePost.data()) {
            int validationResult = validatePostData(title, content, image);
            if (validationResult == 0) {
                // validation passed, proceed with target method
                return joinPoint.proceed();
            } else if (validationResult == 3) {
                // image is too large
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
            } else {
                // validation failed, return bad request response
                return ResponseEntity.badRequest().body(validationResult);
            }
        }
        // no validation
        return joinPoint.proceed();
    }

    private int validatePostData(String title, String content, MultipartFile image) {

        if (title.length() == 0 || content.length() == 0) {
            // title or content invalid
            return 1;
        }

        if (!image.isEmpty()) {
            // image isn't empty
            String contentType = image.getContentType();
            if (!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
                // invalid image type
                return 2;
            }

            long size = image.getSize();
            if (size > 5 * 1024 * 1024) {
                // image is too large
                return 3;
            }
        }

        return 0;
    }

}
