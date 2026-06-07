package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    /**
     * Buscar usuário por email
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Verificar se email já existe
     */
    boolean existsByEmail(String email);
}
