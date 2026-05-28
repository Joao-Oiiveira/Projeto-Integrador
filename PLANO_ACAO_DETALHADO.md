# 🎯 Plano de Ação Detalhado - EduAccess

**Objetivo:** Transformar codebase de MVP para código production-ready  
**Timeline:** 8-12 semanas  
**Data de Criação:** 27/05/2026

---

## 📊 Overview de Tarefas

```
Total: 45 tarefas
Críticas (🔴): 7
Altas (🟠): 12
Médias (🟡): 18
Baixas (🟢): 8
```

---

## 🔴 SPRINT 1: SEGURANÇA (Semana 1-2)

### Task S1.1: Implementar Hashing de Senha

**Status:** 📋 TODO | **Prioridade:** 🔴 CRÍTICA | **Esforço:** 4h

**Arquivo:** `DemoAPI/demo/src/main/java/com/example/demo/controller/UsuarioController.java`

**Checklist:**
- [ ] Adicionar `spring-boot-starter-security` ao build.gradle
- [ ] Criar `SecurityConfig.java` com `BCryptPasswordEncoder`
- [ ] Modificar `UsuarioRepository` para usar hash
- [ ] Atualizar método de login para verificar hash
- [ ] Testar cadastro e login
- [ ] Documentar mudança

**Código de Exemplo:**

```java
// build.gradle
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-security'
}

// SecurityConfig.java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}

// UsuarioController.java
@Autowired
private PasswordEncoder passwordEncoder;

@PostMapping("/cadastro")
public ResponseEntity<?> cadastro(@RequestBody UsuarioDTO dto) {
  // Validar email duplicado
  if (usuarioRepo.existsByEmail(dto.getEmail())) {
    return ResponseEntity.badRequest().body("Email já cadastrado");
  }
  
  Usuario usuario = new Usuario();
  usuario.setEmail(dto.getEmail());
  usuario.setNome(dto.getNome());
  usuario.setSenha(passwordEncoder.encode(dto.getSenha())); // HASH!
  
  Usuario saved = usuarioRepo.save(usuario);
  return ResponseEntity.ok(new UsuarioDTO(saved));
}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
  Usuario usuario = usuarioRepo.findByEmail(dto.getEmail())
    .orElse(null);
    
  if (usuario == null || 
      !passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
    return ResponseEntity.status(401).body("Credenciais inválidas");
  }
  
  return ResponseEntity.ok(new LoginResponseDTO(usuario.getId(), usuario.getEmail()));
}
```

---

### Task S1.2: Restringir CORS

**Status:** 📋 TODO | **Prioridade:** 🔴 CRÍTICA | **Esforço:** 2h

**Arquivo:** `DemoAPI/demo/src/main/java/com/example/demo/config/CorsConfig.java` (NOVO)

**Checklist:**
- [ ] Remover `@CrossOrigin(origins = "*")` de TODOS controllers
- [ ] Criar `CorsConfig.java`
- [ ] Configurar apenas domínios permitidos
- [ ] Testar no Postman com origem não permitida (deve retornar erro CORS)
- [ ] Testar no app mobile/web (deve funcionar)

**Código de Exemplo:**

```java
// CorsConfig.java (NOVO ARQUIVO)
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    // Ambiente de desenvolvimento
    if (isDevelopment()) {
      registry.addMapping("/api/**")
        .allowedOrigins(
          "http://localhost:3000",      // React dev
          "http://localhost:5173",       // Vite dev
          "http://localhost:8080",       // Backend
          "http://10.0.2.2:3000"        // Android emulator
        )
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true)
        .maxAge(3600);
    }
    // Ambiente de produção
    else {
      registry.addMapping("/api/**")
        .allowedOrigins(
          "https://app.seu-dominio.com",
          "https://seu-dominio.com"
        )
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .allowedHeaders("Authorization", "Content-Type")
        .allowCredentials(true)
        .maxAge(86400);
    }
  }
  
  private boolean isDevelopment() {
    return System.getProperty("app.environment", "dev").equals("dev");
  }
}

// Em TODOS controllers, remover isso:
// @CrossOrigin(origins = "*")
```

---

### Task S1.3: Variáveis de Ambiente

**Status:** 📋 TODO | **Prioridade:** 🔴 CRÍTICA | **Esforço:** 1.5h

**Arquivos:**
- `DemoAPI/demo/src/main/resources/application.properties`
- `DemoAPI/demo/.env` (NOVO, adicionar ao .gitignore)

**Checklist:**
- [ ] Criar `.env` com template
- [ ] Modificar `application.properties` para usar variáveis
- [ ] Adicionar `.env` ao `.gitignore`
- [ ] Documentar variáveis necessárias
- [ ] Testar com valores diferentes

**Código de Exemplo:**

```properties
# application.properties (MODIFICAR)
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:projeto_integrador}
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JWT
jwt.secret=${JWT_SECRET:sua-chave-super-secreta-minimo-32-caracteres}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Server
server.port=${SERVER_PORT:8080}
server.servlet.context-path=/api

# Environment
app.environment=${APP_ENVIRONMENT:dev}
```

```bash
# .env (NOVO ARQUIVO - NÃO COMMITAR!)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projeto_integrador
DB_USER=root
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=chave_super_secreta_minimo_32_caracteres
JWT_EXPIRATION=86400000
SERVER_PORT=8080
APP_ENVIRONMENT=dev
```

```gitignore
# .gitignore (ADICIONAR)
.env
.env.local
*.properties.local
```

---

### Task S1.4: Implementar JWT Authentication

**Status:** 📋 TODO | **Prioridade:** 🔴 CRÍTICA | **Esforço:** 6h

**Arquivos:**
- `JwtUtil.java` (NOVO)
- `JwtAuthFilter.java` (NOVO)
- `SecurityConfig.java` (MODIFICAR)
- `UsuarioController.java` (MODIFICAR)

**Checklist:**
- [ ] Adicionar dependência JWT (`jjwt`)
- [ ] Criar `JwtUtil.java`
- [ ] Criar `JwtAuthFilter.java`
- [ ] Atualizar `SecurityConfig.java`
- [ ] Atualizar `/login` para retornar token
- [ ] Testar token inválido (deve retornar 401)
- [ ] Testar token expirado (deve retornar 401)
- [ ] Testar com token válido (deve passar)

**Código de Exemplo:**

```gradle
// build.gradle (ADICIONAR)
dependencies {
  implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
  runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
  runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'
}
```

```java
// JwtUtil.java (NOVO)
@Component
public class JwtUtil {
  @Value("${jwt.secret}")
  private String secret;
  
  @Value("${jwt.expiration}")
  private long expiration;
  
  public String gerarToken(Usuario usuario) {
    return Jwts.builder()
      .subject(usuario.getId().toString())
      .claim("email", usuario.getEmail())
      .issuedAt(new Date())
      .expiration(new Date(System.currentTimeMillis() + expiration))
      .signWith(SignatureAlgorithm.HS512, secret)
      .compact();
  }
  
  public String extrairIdUsuario(String token) {
    return Jwts.parserBuilder()
      .setSigningKey(secret)
      .build()
      .parseClaimsJws(token)
      .getBody()
      .getSubject();
  }
  
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
}

// JwtAuthFilter.java (NOVO)
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
      String token = extrairToken(request);
      
      if (token != null && jwtUtil.validarToken(token)) {
        String idUsuario = jwtUtil.extrairIdUsuario(token);
        
        UsernamePasswordAuthenticationToken auth = 
          new UsernamePasswordAuthenticationToken(idUsuario, null, new ArrayList<>());
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    } catch (Exception e) {
      // Token inválido, continuar sem autenticação
    }
    
    filterChain.doFilter(request, response);
  }
  
  private String extrairToken(HttpServletRequest request) {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      return header.substring(7);
    }
    return null;
  }
}

// SecurityConfig.java (MODIFICAR)
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Autowired
  private JwtAuthFilter jwtAuthFilter;
  
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
  
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf().disable()
      .authorizeHttpRequests(authz -> authz
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers("/api/v1/**").authenticated()
        .anyRequest().permitAll()
      )
      .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
  }
}
```

---

### Task S1.5: Adicionar Spring Security para controle de acesso

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 3h

**Objetivo:** Usuário só acessa seus próprios dados

**Código de Exemplo:**

```java
// UsuarioController.java
@GetMapping("/perfil/{id}")
public ResponseEntity<?> obterPerfil(@PathVariable Long id) {
  // Pegar ID do usuário autenticado
  String usuarioAutenticadoId = 
    SecurityContextHolder.getContext()
      .getAuthentication()
      .getPrincipal()
      .toString();
  
  // Verificar se está tentando acessar dados de outro usuário
  if (!usuarioAutenticadoId.equals(id.toString())) {
    return ResponseEntity.status(403)
      .body(Map.of("message", "Acesso negado"));
  }
  
  Usuario usuario = usuarioRepo.findById(id)
    .orElse(null);
  
  if (usuario == null) {
    return ResponseEntity.notFound().build();
  }
  
  return ResponseEntity.ok(new UsuarioDTO(usuario));
}
```

---

## 🟠 SPRINT 2: REFATORAÇÃO BACKEND (Semana 3-5)

### Task A2.1: Criar DTOs

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 8h

**Pasta:** `DemoAPI/demo/src/main/java/com/example/demo/dto/` (NOVA)

**DTOs a Criar:**
- [ ] `UsuarioDTO.java`
- [ ] `LoginDTO.java`
- [ ] `LoginResponseDTO.java`
- [ ] `MateriaDTO.java`
- [ ] `TarefaDTO.java`
- [ ] `EventoDTO.java`
- [ ] `FlashcardDTO.java`
- [ ] `QuestaoDTO.java`

**Código de Exemplo:**

```java
// UsuarioDTO.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
  private Long id;
  
  @NotBlank(message = "Nome é obrigatório")
  private String nome;
  
  @Email(message = "Email deve ser válido")
  @NotBlank(message = "Email é obrigatório")
  private String email;
  
  @NotBlank(message = "Tipo de deficiência deve ser informado")
  private String tipoDeficiencia;
  
  private LocalDate dataNascimento;
  
  // Constructor para Entity -> DTO
  public UsuarioDTO(Usuario entity) {
    this.id = entity.getId();
    this.nome = entity.getNome();
    this.email = entity.getEmail();
    this.tipoDeficiencia = entity.getTipoDeficiencia();
    this.dataNascimento = entity.getDataNascimento();
  }
  
  // Mapper
  public Usuario toEntity() {
    return Usuario.builder()
      .nome(this.nome)
      .email(this.email)
      .tipoDeficiencia(this.tipoDeficiencia)
      .dataNascimento(this.dataNascimento)
      .build();
  }
}
```

### Task A2.2: Criar Service Layer

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 10h

**Pasta:** `DemoAPI/demo/src/main/java/com/example/demo/service/` (NOVA)

**Services a Criar:**
- [ ] `UsuarioService.java`
- [ ] `MateriaService.java`
- [ ] `TarefaService.java`
- [ ] `FlashcardService.java`
- [ ] `QuestaoService.java`

**Código de Exemplo:**

```java
// UsuarioService.java
@Service
@Transactional
public class UsuarioService {
  @Autowired
  private UsuarioRepository usuarioRepo;
  
  @Autowired
  private PasswordEncoder passwordEncoder;
  
  public UsuarioDTO criar(UsuarioDTO dto) {
    // Validar email único
    if (usuarioRepo.existsByEmail(dto.getEmail())) {
      throw new IllegalArgumentException("Email já cadastrado");
    }
    
    // Mapear DTO para Entity
    Usuario usuario = dto.toEntity();
    usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
    usuario.setDataCriacao(LocalDateTime.now());
    
    // Salvar
    Usuario saved = usuarioRepo.save(usuario);
    
    // Retornar DTO
    return new UsuarioDTO(saved);
  }
  
  public Optional<UsuarioDTO> obterPorId(Long id) {
    return usuarioRepo.findById(id)
      .map(UsuarioDTO::new);
  }
  
  public List<UsuarioDTO> listarTodos() {
    return usuarioRepo.findAll()
      .stream()
      .map(UsuarioDTO::new)
      .collect(Collectors.toList());
  }
  
  public UsuarioDTO atualizar(Long id, UsuarioDTO dto) {
    Usuario usuario = usuarioRepo.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    
    usuario.setNome(dto.getNome());
    usuario.setTipoDeficiencia(dto.getTipoDeficiencia());
    usuario.setDataNascimento(dto.getDataNascimento());
    
    Usuario updated = usuarioRepo.save(usuario);
    return new UsuarioDTO(updated);
  }
  
  public void deletar(Long id) {
    usuarioRepo.deleteById(id);
  }
}
```

### Task A2.3: Adicionar Bean Validation

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 3h

**Arquivo:** `DemoAPI/demo/build.gradle`

**Checklist:**
- [ ] Adicionar `spring-boot-starter-validation`
- [ ] Adicionar anotações a todos DTOs
- [ ] Adicionar `@Valid` em todos endpoints
- [ ] Testar validação (enviar email inválido, etc)

```gradle
// build.gradle
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```

### Task A2.4: Criar GlobalExceptionHandler

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 4h

**Arquivo:** `DemoAPI/demo/src/main/java/com/example/demo/exception/GlobalExceptionHandler.java` (NOVO)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", 400);
    body.put("message", "Validação falhou");
    body.put("errors", e.getBindingResult()
      .getFieldErrors()
      .stream()
      .collect(Collectors.toMap(
        FieldError::getField,
        FieldError::getDefaultMessage
      )));
    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }
  
  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<?> handleNotFound(EntityNotFoundException e) {
    return ResponseEntity.status(404)
      .body(Map.of(
        "timestamp", LocalDateTime.now(),
        "status", 404,
        "message", e.getMessage()
      ));
  }
  
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<?> handleBadRequest(IllegalArgumentException e) {
    return ResponseEntity.status(400)
      .body(Map.of(
        "timestamp", LocalDateTime.now(),
        "status", 400,
        "message", e.getMessage()
      ));
  }
  
  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleGeneric(Exception e) {
    e.printStackTrace();
    return ResponseEntity.status(500)
      .body(Map.of(
        "timestamp", LocalDateTime.now(),
        "status", 500,
        "message", "Erro interno do servidor"
      ));
  }
}
```

### Task A2.5: Adicionar Swagger/OpenAPI

**Status:** 📋 TODO | **Prioridade:** 🟡 MÉDIA | **Esforço:** 3h

```gradle
// build.gradle
dependencies {
  implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.4'
}
```

```yaml
# application.properties
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
```

```java
// SwaggerConfig.java (NOVO)
@Configuration
public class SwaggerConfig {
  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
      .info(new Info()
        .title("EduAccess API")
        .version("1.0")
        .description("API da plataforma educacional EduAccess"));
  }
}

// UsuarioController.java (ADICIONAR)
@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuários", description = "Endpoints de usuários")
public class UsuarioController {
  
  @PostMapping
  @Operation(summary = "Criar novo usuário", 
             description = "Cria um novo usuário no sistema")
  public ResponseEntity<?> criar(@Valid @RequestBody UsuarioDTO dto) {
    // ...
  }
}
```

---

## 🟡 SPRINT 3: QUALIDADE (Semana 6-7)

### Task Q3.1: Adicionar Testes Unitários

**Status:** 📋 TODO | **Prioridade:** 🟡 MÉDIA | **Esforço:** 8h

**Arquivo:** `DemoAPI/demo/src/test/java/com/example/demo/service/UsuarioServiceTest.java`

```gradle
// build.gradle
dependencies {
  testImplementation 'org.springframework.boot:spring-boot-starter-test'
  testImplementation 'org.junit.jupiter:junit-jupiter'
}
```

```java
@SpringBootTest
class UsuarioServiceTest {
  
  @MockBean
  private UsuarioRepository usuarioRepo;
  
  @Autowired
  private UsuarioService usuarioService;
  
  @Test
  void deveCriarUsuario() {
    // Arrange
    UsuarioDTO dto = UsuarioDTO.builder()
      .nome("João")
      .email("joao@example.com")
      .build();
    
    Usuario usuarioEsperado = Usuario.builder()
      .id(1L)
      .nome("João")
      .email("joao@example.com")
      .build();
    
    when(usuarioRepo.save(any())).thenReturn(usuarioEsperado);
    
    // Act
    UsuarioDTO resultado = usuarioService.criar(dto);
    
    // Assert
    assertThat(resultado.getNome()).isEqualTo("João");
    verify(usuarioRepo, times(1)).save(any());
  }
}
```

---

## 🟢 SPRINT 4 & 5: MOBILE & FRONTEND

(Tarefas similares para Flutter e React - seguindo padrões já documentados)

---

## 📅 Timeline Sugerida

```
Semana 1-2:   Sprint 1 (Segurança) - BLOQUEADOR
Semana 3-5:   Sprint 2 (Refatoração)
Semana 6-7:   Sprint 3 (Testes)
Semana 8-9:   Sprint 4 (DevOps)
Semana 10-12: Sprint 5 (Mobile/Frontend)
```

---

## 🎯 Critério de Aceite

### Por Sprint

**Sprint 1 - Segurança:**
- [ ] Senhas com hash BCrypt
- [ ] CORS restringido
- [ ] Variáveis de ambiente ativas
- [ ] JWT funcionando
- [ ] Sem credenciais em código

**Sprint 2 - Refatoração:**
- [ ] 100% dos endpoints com DTOs
- [ ] 100% dos endpoints com Service
- [ ] Validação funcionando
- [ ] GlobalExceptionHandler respondendo
- [ ] Swagger acessível em /swagger-ui.html

**Sprint 3 - Testes:**
- [ ] Cobertura mínima 70%
- [ ] Testes rodam sem erro
- [ ] Build passa em CI

**Sprint 4 - DevOps:**
- [ ] Dockerfile buildado
- [ ] docker-compose funciona
- [ ] CI/CD pipeline verde

**Sprint 5 - Mobile/Frontend:**
- [ ] State management implementado
- [ ] Validação em forms funcionando
- [ ] Tratamento de erros implementado

---

## 💡 Dicas de Implementação

1. **Commit Frequente:** Fazer commits pequenos e incrementais
2. **Branch por Tarefa:** Uma branch por task, facilitando review
3. **Testing Primeiro:** Escrever testes enquanto desenvolve
4. **Code Review:** Revisar antes de mergeado
5. **Documentação:** Atualizar docs junto com código

---

**Versão:** 1.0  
**Data:** 27/05/2026  
**Autor:** Claude (Supervisor)

