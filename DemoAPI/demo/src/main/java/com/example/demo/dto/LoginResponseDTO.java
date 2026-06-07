package com.example.demo.dto;

public class LoginResponseDTO {

    private Long id;
    private String email;
    private String token;
    private Long tokenExpiration;

    public LoginResponseDTO(Long id, String email, String token, Long tokenExpiration) {
        this.id = id;
        this.email = email;
        this.token = token;
        this.tokenExpiration = tokenExpiration;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getTokenExpiration() {
        return tokenExpiration;
    }

    public void setTokenExpiration(Long tokenExpiration) {
        this.tokenExpiration = tokenExpiration;
    }
}
