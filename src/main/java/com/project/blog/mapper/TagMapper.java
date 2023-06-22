package com.project.blog.mapper;

import com.project.blog.pojo.Tag;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TagMapper {

    @Select("SELECT * FROM tag")
    List<Tag> findAll();

    @Select("SELECT t.* FROM tag t JOIN post_tag pt ON t.id=pt.tag_id WHERE pt.post_id=#{postId}")
    List<Tag> findByPostId(int postId);

    @Select("SELECT * FROM tag WHERE name=#{name}")
    Tag findByName(String name);

    @Insert("INSERT INTO tag (name) VALUES (#{name})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Tag tag);

}
