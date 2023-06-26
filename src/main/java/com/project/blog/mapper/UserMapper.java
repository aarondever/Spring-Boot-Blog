package com.project.blog.mapper;

import com.project.blog.pojo.UserBean;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {

    @Select("SELECT * FROM user WHERE id = #{id}")
    UserBean findById(int id);

    @Select("SELECT * FROM user WHERE username = #{username}")
    UserBean findByUsername(String username);

    @Insert("INSERT INTO user(username, password) VALUES(#{username}, #{password})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(UserBean user);

    @Update("UPDATE user SET username=#{username} WHERE id=#{id}")
    int updateUsername(UserBean user);

    @Update("UPDATE user SET password=#{password} WHERE id=#{id}")
    int updatePassword(UserBean user);

}
