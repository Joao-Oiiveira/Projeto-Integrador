package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extrairTokenDoHeader(request);

            if (token != null && jwtUtil.validarToken(token)) {
                Long idUsuario = jwtUtil.extrairIdUsuario(token);
                String email = jwtUtil.extrairEmail(token);

                // Criar autenticação
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                idUsuario,
                                email,
                                new ArrayList<>()
                        );

                // Adicionar ao contexto de segurança
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            // Token inválido, continuar sem autenticação
            logger.error("Erro ao validar token: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrai o token do header Authorization
     */
    private String extrairTokenDoHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7); // Remove "Bearer "
        }

        return null;
    }
}
