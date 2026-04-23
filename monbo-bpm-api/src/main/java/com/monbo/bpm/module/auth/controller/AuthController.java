package com.monbo.bpm.module.auth.controller;

import com.monbo.bpm.common.Result;
import com.monbo.bpm.module.auth.dto.LoginDTO;
import com.monbo.bpm.module.auth.dto.RegisterDTO;
import com.monbo.bpm.module.auth.util.JwtUtil;
import com.monbo.bpm.module.user.entity.User;
import com.monbo.bpm.module.user.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 认证接口：登录 / 注册 / 当前用户信息
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final IUserService userService;

    @PostMapping("/login")
    public Result<?> login(@Valid @RequestBody LoginDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtil.generateToken(dto.getUsername());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("username", dto.getUsername());
        return Result.ok(data);
    }

    @PostMapping("/register")
    public Result<?> register(@Valid @RequestBody RegisterDTO dto) {
        userService.register(dto);
        return Result.ok("注册成功");
    }

    @GetMapping("/info")
    public Result<?> info() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> data = new HashMap<>();
        data.put("username", auth.getName());
        data.put("authorities", auth.getAuthorities().stream()
            .map(a -> a.getAuthority())
            .collect(Collectors.toList()));
        return Result.ok(data);
    }
}
