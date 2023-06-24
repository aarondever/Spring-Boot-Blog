package com.project.blog.service;

import com.project.blog.mapper.TagMapper;
import com.project.blog.pojo.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagService {

    private final TagMapper tagMapper;

    @Autowired
    public TagService(TagMapper tagMapper) {
        this.tagMapper = tagMapper;
    }

    public List<Tag> getTags(){
        return tagMapper.findAll();
    }

}
