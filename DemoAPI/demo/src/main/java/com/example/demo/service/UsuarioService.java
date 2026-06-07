package com.example.demo.service;

import com.example.demo.dto.LoginDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.UsuarioCadastroDTO;
import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.exception.CredenciaisInvalidasException;
import com.example.demo.exception.EmailDuplicadoException;
import com.example.demo.exception.UsuarioNaoEncontradoException;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.expiration}")
    private long tokenExpiration;

    /**
     * Cadastra um novo usuário com senha criptografada
     */
    public UsuarioResponseDTO cadastrar(UsuarioCadastroDTO dto) {
        // Verificar se email já existe
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(dto.getEmail());
        if (usuarioExistente.isPresent()) {
            throw new EmailDuplicadoException("Email " + dto.getEmail() + " já está cadastrado");
        }

        // Criar novo usuário
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());

        // Criptografar a senha com BCrypt
        String senhaHash = passwordEncoder.encode(dto.getSenha());
        usuario.setSenha(senhaHash);

        // Salvar no banco
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        // Retornar DTO (SEM a senha!)
        return new UsuarioResponseDTO(usuarioSalvo.getId(), usuarioSalvo.getNome(), usuarioSalvo.getEmail());
    }

    /**
     * Realiza login e gera JWT token
     */
    public LoginResponseDTO login(LoginDTO dto) {
        // Buscar usuário pelo email
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(dto.getEmail());
        if (usuarioOpt.isEmpty()) {
            throw new CredenciaisInvalidasException("Email ou senha inválidos");
        }

        Usuario usuario = usuarioOpt.get();

        // Verificar se a senha está correta
        boolean senhaValida = passwordEncoder.matches(dto.getSenha(), usuario.getSenha());
        if (!senhaValida) {
            throw new CredenciaisInvalidasException("Email ou senha inválidos");
        }

        // Gerar JWT token
        String token = jwtUtil.gerarToken(usuario.getId(), usuario.getEmail());

        // Retornar response com token
        return new LoginResponseDTO(usuario.getId(), usuario.getEmail(), token, tokenExpiration);
    }

    /**
     * Obtém um usuário por ID (com controle de acesso)
     */
    public UsuarioResponseDTO obterPorId(Long id, Long usuarioAutenticadoId) {
        // Verificar se está tentando acessar dados de outro usuário
        if (!id.equals(usuarioAutenticadoId)) {
            throw new RuntimeException("Acesso negado");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário com ID " + id + " não encontrado"));

        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
