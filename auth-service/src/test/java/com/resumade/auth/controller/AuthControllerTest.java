package com.resumade.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumade.auth.dto.*;
import com.resumade.auth.security.JwtService;
import com.resumade.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        authResponse = new AuthResponse("token", 1, "John Doe", "john@example.com", "USER", "FREE");
    }

    @Test
    void register_ReturnsCreated() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setConfirmPassword("password123");

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void login_ReturnsOk() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    void getProfile_ReturnsOk() throws Exception {
        when(authService.getUserById(1)).thenReturn(authResponse);

        mockMvc.perform(get("/api/v1/auth/profile/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    void updateProfile_ReturnsOk() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");

        when(authService.updateProfile(eq(1), any(UpdateProfileRequest.class))).thenReturn(authResponse);

        mockMvc.perform(put("/api/v1/auth/profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void changePassword_ReturnsOk() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old");
        request.setNewPassword("new12345");
        request.setConfirmPassword("new12345");

        mockMvc.perform(put("/api/v1/auth/password/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void updateSubscription_ReturnsOk() throws Exception {
        mockMvc.perform(put("/api/v1/auth/subscription/1")
                .param("plan", "PREMIUM"))
                .andExpect(status().isOk());
    }

    @Test
    void deactivateUser_ReturnsOk() throws Exception {
        mockMvc.perform(delete("/api/v1/auth/deactivate/1"))
                .andExpect(status().isOk());
    }
}
