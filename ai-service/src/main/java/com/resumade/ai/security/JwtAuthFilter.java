package com.resumade.ai.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${jwt.secret}")
    private String secretKey;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String xUserId = request.getHeader("X-User-Id");
        String xPlan = request.getHeader("X-User-Plan");

        if (xUserId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Integer userId = Integer.parseInt(xUserId);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        "gateway-user-" + userId, null, new ArrayList<>()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                request.setAttribute("userId", userId);
                request.setAttribute("plan", xPlan != null ? xPlan : "FREE");
                log.debug("Authenticated via Gateway headers: userId={}, plan={}", userId, xPlan);
                filterChain.doFilter(request, response);
                return;
            } catch (NumberFormatException e) {
                log.warn("Invalid X-User-Id header from gateway: {}", xUserId);
            }
        }

        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                final String jwt = authHeader.substring(7);
                final Claims claims = extractClaims(jwt);
                final String userEmail = claims.getSubject();
                
                Object userIdObj = claims.get("userId");
                final Integer userId = (userIdObj instanceof Number) ? ((Number) userIdObj).intValue() : null;
                
                final String plan = (String) claims.get("plan");

                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail, null, new ArrayList<>()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    request.setAttribute("userId", userId);
                    request.setAttribute("plan", plan);
                    log.debug("Authenticated via JWT: {} with ID: {}", userEmail, userId);
                }
            } catch (Exception e) {
                log.error("JWT Authentication failed: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private Claims extractClaims(String token) {
        byte[] keyBytes = secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
