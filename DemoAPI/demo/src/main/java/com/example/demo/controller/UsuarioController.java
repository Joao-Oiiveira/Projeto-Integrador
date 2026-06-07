package com.example.demo.controller;

import com.example.demo.dto.LoginDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.UsuarioCadastroDTO;
import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Cadastrar novo usuário
     * POST /api/usuarios/cadastro
     */
    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponseDTO> cadastro(@Valid @RequestBody UsuarioCadastroDTO dto) {
        UsuarioResponseDTO usuarioCriado = usuarioService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
    }

    /**
     * Login - gera JWT token
     * POST /api/usuarios/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginDTO dto) {
        LoginResponseDTO response = usuarioService.login(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * Obter perfil do usuário autenticado
     * GET /api/usuarios/perfil
     * Requer: Authorization: Bearer <token>
     */
    @GetMapping("/perfil")
    public ResponseEntity<UsuarioResponseDTO> obterPerfil(Authentication authentication) {
        // Pega o ID do usuário autenticado do JWT
        Long usuarioId = (Long) authentication.getPrincipal();

        UsuarioResponseDTO perfil = usuarioService.obterPorId(usuarioId, usuarioId);
        return ResponseEntity.ok(perfil);
    }
}

