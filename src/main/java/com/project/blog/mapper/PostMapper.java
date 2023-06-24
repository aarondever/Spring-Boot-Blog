package com.project.blog.mapper;

import com.project.blog.pojo.Post;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PostMapper {

    @Select({"<script>",
            "SELECT DISTINCT p.* FROM post p",
            "LEFT JOIN post_tag pt ON p.id = pt.post_id",
            "<where>",
            "<if test='search != \"\"'> AND (title LIKE CONCAT('%', #{search}, '%') OR content LIKE CONCAT('%', #{search}, '%'))</if>",
            "<if test='tagId != 0'> AND pt.tag_id = #{tagId}</if>",
            "</where>",
            "ORDER BY p.id DESC",
            "</script>"})
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "title", column = "title"),
            @Result(property = "content", column = "content"),
            @Result(property = "image", column = "image"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "user", column = "user_id", one = @One(select = "com.project.blog.mapper.UserMapper.findById")),
            @Result(property = "tags", column = "id", many = @Many(select = "com.project.blog.mapper.TagMapper.findByPostId"))
    })
    List<Post> findAll(@Param("search") String search, @Param("tagId") int tagId);

    @Select("SELECT * FROM post WHERE id=#{postId}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "title", column = "title"),
            @Result(property = "content", column = "content"),
            @Result(property = "image", column = "image"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "user", column = "user_id", one = @One(select = "com.project.blog.mapper.UserMapper.findById")),
            @Result(property = "tags", column = "id", many = @Many(select = "com.project.blog.mapper.TagMapper.findByPostId"))
    })
    Post findById(int postId);

    @Insert("INSERT INTO post (title, content, image, created_at, updated_at, user_id) VALUES (#{title}, #{content}, #{image}, #{createdAt}, #{updatedAt}, #{user.id})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Post post);

    @Update("UPDATE post SET title=#{title}, content=#{content}, image=#{image}, updated_at=#{updatedAt} WHERE id=#{id}")
    int update(Post post);

    @Delete("DELETE FROM post WHERE id=#{postId}")
    int delete(int postId);

    @Select("SELECT tag_id FROM post_tag WHERE post_id=#{postId}")
    List<Integer> findPostTagIdsByPostId(int postId);

    @Select("SELECT COUNT(tag_id) FROM post_tag WHERE tag_id=#{tagId}")
    int getPostTagCountByTagId(int tagId);

    @Insert("INSERT INTO post_tag(post_id, tag_id) VALUES(#{postId}, #{tagId})")
    int insertPostTag(int postId, int tagId);

    @Delete("DELETE FROM post_tag WHERE post_id=#{postId}")
    int deletePostTagByPostId(int postId);

}
