package com.project.blog.config;

import com.project.blog.filter.CookieCsrfFilter;
import com.project.blog.filter.SpaWebFilter;
import com.project.blog.handler.CustomAuthenticationFailureHandler;
import com.project.blog.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    @Autowired
    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/", "/index.html", "/static/**",
                                "/images/**", "/*.ico", "/*.json", "/*.png", "/api/tag",
                                "/api/user", "/api/login", "/api/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/post/**").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf((csrf) -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                )
                .addFilterAfter(new CookieCsrfFilter(), BasicAuthenticationFilter.class)
                .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class)
                .formLogin(formLogin -> formLogin
                        .loginPage("/login")
                        .loginProcessingUrl("/api/login")
                        .defaultSuccessUrl("/", true)
                        .failureHandler(new CustomAuthenticationFailureHandler())
                        .permitAll()
                )
                .userDetailsService(customUserDetailsService)
                .logout(logout -> logout.logoutUrl("/api/logout"));
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
