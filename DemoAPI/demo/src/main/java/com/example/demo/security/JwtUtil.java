package com.example.demo.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * Gera um novo JWT token para o usuário
     */
    public String gerarToken(Long usuarioId, String email) {
        return Jwts.builder()
                .subject(usuarioId.toString())
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    /**
     * Extrai o ID do usuário do token
     */
    public Long extrairIdUsuario(String token) {
        try {
            String subject = Jwts.parserBuilder()
                    .setSigningKey(secret)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            return Long.parseLong(subject);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Extrai o email do token
     */
    public String extrairEmail(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secret)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("email", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Valida se o token é válido
     */
    public boolean validarToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secret)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Verifica se o token está expirado
     */
    public boolean tokenExpirado(String token) {
        try {
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(secret)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            return expiration.before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return true;
        }
    }
}
