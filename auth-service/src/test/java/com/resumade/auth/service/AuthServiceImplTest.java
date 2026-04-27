package com.resumade.auth.service;

import com.resumade.auth.dto.*;
import com.resumade.auth.entity.User;
import com.resumade.auth.exception.EmailAlreadyExistsException;
import com.resumade.auth.exception.InvalidCredentialsException;
import com.resumade.auth.exception.UserNotFoundException;
import com.resumade.auth.repository.UserRepository;
import com.resumade.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        org.springframework.test.util.ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        org.springframework.test.util.ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L);

        // Re-inject the real jwtService into authService because @InjectMocks already tried to inject the mock
        org.springframework.test.util.ReflectionTestUtils.setField(authService, "jwtService", jwtService);

        user = new User(
                "John Doe",
                "john@example.com",
                "encodedPassword",
                User.Role.USER,
                User.Provider.LOCAL,
                true,
                User.SubscriptionPlan.FREE
        );
        user.setUserId(1);

        userDetails = new org.springframework.security.core.userdetails.User(
                "john@example.com",
                "encodedPassword",
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setConfirmPassword("password123");
        request.setFullName("John Doe");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken()); // Real token generated
        assertEquals("john@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@example.com");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
    }

    @Test
    void register_PasswordsDoNotMatch_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setConfirmPassword("different");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.register(request));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrong");

        when(authenticationManager.authenticate(any())).thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.login(request));
    }

    @Test
    void refreshToken_Success() {
        String oldToken = jwtService.generateToken(userDetails, user);
        String authHeader = "Bearer " + oldToken;
        
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);

        AuthResponse response = authService.refreshToken(authHeader);

        assertNotNull(response);
        assertNotNull(response.getToken());
    }

    @Test
    void refreshToken_InvalidHeader_ThrowsException() {
        assertThrows(InvalidCredentialsException.class, () -> authService.refreshToken(null));
        assertThrows(InvalidCredentialsException.class, () -> authService.refreshToken("InvalidHeader"));
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        AuthResponse response = authService.getUserById(1);
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    void getUserById_NotFound_ThrowsException() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> authService.getUserById(1));
    }

    @Test
    void updateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");
        request.setEmail("updated@example.com");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        AuthResponse response = authService.updateProfile(1, request);

        assertEquals("Updated Name", user.getFullName());
        assertEquals("updated@example.com", user.getEmail());
    }

    @Test
    void changePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old");
        request.setNewPassword("new12345");
        request.setConfirmPassword("new12345");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedNew");

        authService.changePassword(1, request);

        verify(userRepository).save(user);
    }

    @Test
    void changePassword_WrongCurrent_ThrowsException() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrong");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.changePassword(1, request));
    }

    @Test
    void updateSubscription_Success() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        authService.updateSubscription(1, "PREMIUM");
        assertEquals(User.SubscriptionPlan.PREMIUM, user.getSubscriptionPlan());
        verify(userRepository).save(user);
    }

    @Test
    void getAdminStats_ReturnsCorrectMap() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countBySubscriptionPlan(User.SubscriptionPlan.PREMIUM)).thenReturn(3L);
        when(userRepository.countByIsActiveTrue()).thenReturn(8L);

        Map<String, Object> stats = authService.getAdminStats();

        assertEquals(10L, stats.get("totalUsers"));
        assertEquals(3L, stats.get("premiumUsers"));
        assertEquals(8L, stats.get("activeUsers"));
    }

    @Test
    void deleteUser_CallsRepository() {
        authService.deleteUser(1);
        verify(userRepository).deleteById(1);
    }
}
