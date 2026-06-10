# 📋 Documentação Técnica Completa - EduAccess (StudyFlow)

**Status:** 🛠️ Em desenvolvimento | **Última atualização:** 27/05/2026

---

## 📚 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Arquitetura e Stack](#arquitetura-e-stack)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
5. [Problemas Identificados](#problemas-identificados)
6. [Plano de Melhorias](#plano-de-melhorias)
7. [Checklist de Supervisão](#checklist-de-supervisão)

---

## 🎯 Visão Geral

**EduAccess** (codinome StudyFlow) é uma plataforma educacional multiplataforma com foco em:

- ✅ **Organização acadêmica** - Calendário, tarefas, eventos
- ✅ **Aprendizado ativo** - Flashcards com repetição espaçada
- ✅ **IA Contextualizada** - Resumos, explicações, geração de conteúdo
- ✅ **Acessibilidade** - Tema configurável, alto contraste, text-to-speech
- ✅ **Perfil educacional** - Adaptação para diferentes necessidades (TDAH, dislexia, autismo, etc)

**Públicos-alvo:**
- Estudantes individuais
- Instituições (importação de disciplinas via JSON)
- Usuários com necessidades especiais

---

## 🏗️ Arquitetura e Stack

### Camadas da Aplicação

```
┌─────────────────────────────────────────────────┐
│         Frontend (Web React + Mobile Flutter)   │
├─────────────────────────────────────────────────┤
│            API REST (Spring Boot 4.0.3)         │
├─────────────────────────────────────────────────┤
│      Banco de Dados (MySQL 8.0+)                │
└─────────────────────────────────────────────────┘
```

### Tecnologias por Componente

| Camada | Tecnologia | Versão | Status |
|--------|-----------|--------|--------|
| **Backend** | Java | 21 | ✅ |
| **Framework Backend** | Spring Boot | 4.0.3 | ✅ |
| **ORM** | Spring Data JPA/Hibernate | Latest | ✅ |
| **Banco de Dados** | MySQL | 8.0+ | ✅ |
| **Frontend Web** | React | Latest | ✅ (Novo) |
| **Frontend Mobile** | Flutter | Stable | ✅ |
| **Build Tool Backend** | Gradle | Latest | ✅ |
| **Package Manager Mobile** | pub | Latest | ✅ |

---

## 📂 Estrutura de Pastas

```
Projeto-Integrador/
├── DemoAPI/                          # Backend Spring Boot
│   └── demo/
│       ├── src/main/java/com/example/demo/
│       │   ├── controller/           # Endpoints REST
│       │   ├── model/                # Entidades JPA
│       │   ├── repository/           # Spring Data JPA
│       │   └── resources/
│       │       └── application.properties
│       ├── build.gradle
│       └── gradlew
│
├── Mobile/                           # Frontend Mobile Flutter
│   └── mobile/
│       ├── lib/
│       │   ├── main.dart
│       │   ├── rotas.dart
│       │   ├── telas/               # Screens (UI)
│       │   ├── servicos/            # API Services
│       │   └── tema/                # Colors, TextStyles
│       ├── pubspec.yaml
│       └── pubspec.lock
│
├── eduacess-frontend/                # Frontend Web React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── layouts/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Banco de dados/                   # Documentação & Scripts SQL
│   ├── DER.jpg                       # Diagrama Entidade-Relacionamento
│   ├── script_criacao.sql
│   └── dados_exemplo.sql
│
├── README.md                         # Descrição geral
├── ANALISE.md                        # Audit de segurança/arquitetura
├── Boas praticas.txt                 # Padrões Flutter
└── DOCUMENTACAO_TECNICA.md           # Este arquivo

```

### Endpoints Principais (API)

| Recurso | Base Path | Métodos | Descrição |
|---------|-----------|---------|-----------|
| **Autenticação** | `/apiUsuario` | POST, GET | Login, cadastro, perfil |
| **Disciplinas** | `/apiMateria` | CRUD | Criar/ler/atualizar/deletar disciplinas |
| **Agenda** | `/apiCompromisso` | CRUD | Tarefas e eventos |
| **Flashcards** | `/apiFlashcard` | CRUD | Cartões para repetição espaçada |
| **Questões** | `/apiQuestao` | CRUD | Banco de perguntas |
| **IA** | (não implementado) | POST | Integração com Claude/Gemini |

---

## 👨‍💻 Guia de Desenvolvimento

### Setup Inicial

#### Backend
```bash
# 1. Clonar repositório
git clone https://github.com/Joao-Oiiveira/Projeto-Integrador.git
cd Projeto-Integrador/DemoAPI/demo

# 2. Garantir que MySQL está rodando
# Windows: MySQL é geralmente um serviço
# Linux: sudo systemctl start mysql
# macOS: brew services start mysql-community-server

# 3. Criar banco de dados (se não existir)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS projeto_integrador;"

# 4. Executar backend
./gradlew bootRun
# API disponível em http://localhost:8080
```

#### Mobile (Flutter)
```bash
cd Projeto-Integrador/Mobile/mobile

# 1. Verificar Flutter
flutter doctor

# 2. Obter dependências
flutter pub get

# 3. Executar
flutter run
```

#### Frontend Web (React)
```bash
cd Projeto-Integrador/eduacess-frontend

# 1. Instalar dependências
npm install

# 2. Executar dev server
npm run dev

# 3. Frontend disponível em http://localhost:5173 (Vite)
```

### Convenções de Código

#### Backend (Java/Spring)

**Nomeclatura de Controllers:**
```java
// ✅ Correto
@RestController
@RequestMapping("/api/v1/disciplinas")
public class DisciplinaController { }

// ❌ Evitar
@RestController
@RequestMapping("/apiMateria")
public class MateriaController { }
```

**Estrutura esperada (após refatoração):**
```
controller/    → Recebe requests
service/       → Lógica de negócio
repository/    → Persistência
dto/           → Data Transfer Objects
model/         → Entidades JPA
```

#### Mobile (Flutter)

**Estrutura recomendada (já documentada em Boas praticas.txt):**
```
lib/
├── main.dart
├── routes.dart
├── models/        → Classes de dados com fromJson/toJson
├── services/      → Chamadas HTTP
├── screens/       → Telas (StatefulWidget)
├── widgets/       → Componentes reutilizáveis
├── theme/         → AppColors, AppTextStyles
└── utils/         → Funções auxiliares
```

#### Frontend Web (React)

**Estrutura recomendada:**
```
src/
├── components/    → Componentes UI reutilizáveis
├── pages/         → Páginas/rotas completas
├── services/      → Chamadas de API (axios/fetch)
├── hooks/         → Custom React hooks
├── context/       → Context API para estado global
├── assets/        → Imagens, ícones, fontes
└── styles/        → CSS modules ou styled-components
```

---

## 🚨 Problemas Identificados

### 🔴 CRÍTICO (Segurança)

#### 1. **Senhas em Texto Plano**
- **Problema:** Backend não faz hash de senhas
- **Risco:** Se banco for comprometido, todas as senhas ficarão expostas
- **Solução:**
  ```java
  // Adicionar ao pom.xml/build.gradle
  // spring-boot-starter-security
  
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
  
  // No controller
  String senhaHash = passwordEncoder.encode(usuario.getSenha());
  ```
- **Prioridade:** IMEDIATA

#### 2. **CORS Permissivo**
- **Problema:** `@CrossOrigin(origins = "*")` em todos controllers
- **Risco:** Qualquer site malicioso pode fazer requisições à API
- **Solução:**
  ```java
  @Configuration
  public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
      registry.addMapping("/api/**")
        .allowedOrigins("https://seu-dominio.com", "https://app.seu-dominio.com")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .maxAge(3600);
    }
  }
  ```
- **Prioridade:** IMEDIATA

#### 3. **Credenciais Hardcoded**
- **Problema:** `application.properties` com senhas em texto plano
- **Risco:** Se repositório vazar, credenciais do banco ficam expostas
- **Solução:**
  ```properties
  # .gitignore
  application-local.properties
  application.properties (adicionar à .env)
  
  # Usar variáveis de ambiente
  spring.datasource.password=${DB_PASSWORD}
  spring.datasource.username=${DB_USERNAME}
  ```
- **Prioridade:** IMEDIATA

#### 4. **Sem Autenticação/Autorização**
- **Problema:** Endpoints abertos, qualquer um pode CRUD dados
- **Risco:** Qualquer usuário pode acessar/modificar dados de outros
- **Solução:** Implementar JWT
  ```java
  // SecurityConfig.java
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf().disable()
       .authorizeHttpRequests(authz -> authz
           .requestMatchers("/api/auth/**").permitAll()
           .requestMatchers("/api/v1/**").authenticated()
       )
       .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
  ```
- **Prioridade:** IMEDIATA

---

### 🟡 MÉDIO (Arquitetura)

#### 1. **Sem Camada de Serviço (Service Layer)**
- **Problema:** Lógica de negócio espalhada nos controllers
- **Impacto:** Dificuldade em reutilizar código, testar, manter
- **Solução:**
  ```java
  // Antes (❌)
  @PostMapping("/")
  public Materia criar(@RequestBody Materia materia) {
    return repo.save(materia); // Lógica no controller
  }
  
  // Depois (✅)
  @PostMapping("/")
  public MateriaDTO criar(@RequestBody MateriaDTO dto) {
    return service.criarMateria(dto);
  }
  
  // Service
  @Service
  public class MateriaService {
    public MateriaDTO criarMateria(MateriaDTO dto) {
      // Validações, regras de negócio
      Materia materia = mapper.toEntity(dto);
      return mapper.toDTO(repo.save(materia));
    }
  }
  ```
- **Prioridade:** ALTA

#### 2. **Sem DTOs (Data Transfer Objects)**
- **Problema:** Entidades JPA expostas diretamente na API
- **Impacto:** Mudanças no banco quebram API; expõe campos internos
- **Solução:**
  ```java
  // DTO
  @Data
  public class MateriaDTO {
    private String id;
    private String nome;
    private String cor;
    private int progresso;
    // NÃO expõe chaves estrangeiras ou timestamps internos
  }
  
  // Mapper (MapStruct ou manual)
  public class MateriaMapper {
    public static MateriaDTO toDTO(Materia entity) {
      return MateriaDTO.builder()
        .id(entity.getId())
        .nome(entity.getNome())
        .build();
    }
  }
  ```
- **Prioridade:** ALTA

#### 3. **Sem Validação (Bean Validation)**
- **Problema:** Campos como email, data não validados no backend
- **Impacto:** Dados inconsistentes no banco
- **Solução:**
  ```java
  @Data
  public class UsuarioDTO {
    @NotBlank(message = "Nome é obrigatório")
    private String nome;
    
    @Email(message = "Email inválido")
    private String email;
    
    @Past(message = "Data de nascimento deve estar no passado")
    private LocalDate dataNascimento;
    
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String senha;
  }
  
  // No controller
  @PostMapping
  public ResponseEntity<?> criar(@Valid @RequestBody UsuarioDTO dto) {
    // Se validação falhar, retorna 400 automaticamente
    return ResponseEntity.ok(service.criar(dto));
  }
  ```
- **Prioridade:** ALTA

#### 4. **Sem Tratamento Global de Erros**
- **Problema:** API pode retornar stacktraces completos
- **Impacto:** Expõe detalhes da infraestrutura; experiência ruim pro cliente
- **Solução:**
  ```java
  @RestControllerAdvice
  public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("timestamp", new Date());
      body.put("status", 400);
      body.put("message", "Validação falhou");
      body.put("errors", e.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(err -> Map.of(
          "field", err.getField(),
          "message", err.getDefaultMessage()
        ))
        .collect(Collectors.toList()));
      return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<?> handleNotFound(EntityNotFoundException e) {
      return ResponseEntity.status(404)
        .body(Map.of("message", "Recurso não encontrado"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
      return ResponseEntity.status(500)
        .body(Map.of("message", "Erro interno do servidor"));
    }
  }
  ```
- **Prioridade:** MÉDIA

#### 5. **Gerenciamento de Estado no Flutter**
- **Problema:** Lógica de negócio misturada com UI em StatefulWidgets
- **Impacto:** Código de difícil leitura e teste; memory leaks
- **Solução (Priority: MÉDIA):**
  ```yaml
  # pubspec.yaml
  dependencies:
    flutter_riverpod: ^2.5.0
    # OU
    provider: ^6.0.0
  ```
  
  ```dart
  // Riverpod Provider
  final materiasProvider = FutureProvider<List<Materia>>((ref) async {
    return await DisciplinasService.getMaterias();
  });
  
  // Screen
  class MaterialScreen extends ConsumerWidget {
    @override
    Widget build(BuildContext context, WidgetRef ref) {
      final materiasAsync = ref.watch(materiasProvider);
      
      return materiasAsync.when(
        data: (materias) => ListView(...),
        loading: () => CircularProgressIndicator(),
        error: (err, stack) => ErrorWidget(error: err),
      );
    }
  }
  ```

---

### 🟢 BAIXA (Manutenibilidade)

#### 1. **Falta Documentação de API (Swagger/OpenAPI)**
- **Solução:** Adicionar Springdoc OpenAPI
- **Prioridade:** MÉDIA

#### 2. **Sem Testes Automatizados**
- **Status:** Pasta `/src/test` existe mas está vazia
- **Solução:** Implementar testes unitários (JUnit 5) e integração (TestContainers)
- **Prioridade:** MÉDIA

#### 3. **Sem Logging Estruturado**
- **Solução:** Usar SLF4J com Logback
- **Prioridade:** BAIXA

#### 4. **Sem CI/CD Pipeline**
- **Solução:** GitHub Actions ou GitLab CI
- **Prioridade:** BAIXA

#### 5. **Sem Containerização (Docker)**
- **Solução:** Dockerfile para backend, docker-compose para orquestração
- **Prioridade:** BAIXA

#### 6. **Nomes genéricos (demo, example)**
- **Impacto:** Confuso em repositório
- **Solução:** Renomear para `eduacess-api` ou `projeto-integrador-api`
- **Prioridade:** BAIXA

---

## 📈 Plano de Melhorias

### Sprint 1: Segurança (1-2 semanas)

- [ ] Implementar hashing de senha (BCrypt)
- [ ] Restringir CORS por domínios
- [ ] Movimentar credenciais para variáveis de ambiente
- [ ] Implementar JWT Authentication
- [ ] Adicionar teste de segurança básico

**Entrega esperada:** API segura para o ambiente de produção.

---

### Sprint 2: Refatoração Backend (2-3 semanas)

- [ ] Criar camada Service
- [ ] Implementar DTOs para todos endpoints
- [ ] Adicionar Bean Validation
- [ ] Criar GlobalExceptionHandler
- [ ] Implementar Swagger/OpenAPI

**Entrega esperada:** Backend com arquitetura escalável.

---

### Sprint 3: Qualidade (2 semanas)

- [ ] Adicionar testes unitários (JUnit 5)
- [ ] Adicionar testes de integração (TestContainers)
- [ ] Configurar logging estruturado (SLF4J/Logback)
- [ ] Coverage mínimo 70%

**Entrega esperada:** Codebase mais confiável.

---

### Sprint 4: DevOps (1-2 semanas)

- [ ] Criar Dockerfile para backend
- [ ] Configurar docker-compose
- [ ] Adicionar GitHub Actions CI/CD
- [ ] Setup automático do banco de dados

**Entrega esperada:** Ambiente de deployment automatizado.

---

### Sprint 5: Mobile/Frontend (2-3 semanas)

- [ ] Implementar Riverpod para gerenciamento de estado
- [ ] Adicionar validação de formulários
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states em todas screens
- [ ] Refatorar React frontend (auditoria completa)

**Entrega esperada:** UX melhorada e código mais testável.

---

## ✅ Checklist de Supervisão

Use este checklist regularmente para acompanhar a saúde do projeto.

### Antes de cada Merge/PR

- [ ] Código segue padrões da pasta (Backend/Mobile/Web)
- [ ] Sem console.logs, prints ou debug code
- [ ] Sem credenciais ou secrets hardcoded
- [ ] Validações implementadas (backend + frontend)
- [ ] Tratamento de erros implementado
- [ ] Testes passando (se aplicável)
- [ ] Sem duplicação de código
- [ ] Documentação atualizada

### Semanal

- [ ] Todos containers (Android/iOS) compilam
- [ ] Backend inicia sem erros
- [ ] Frontend web carrega
- [ ] Integração mobile-backend funciona
- [ ] Logs sensatos (sem verbosidade excessiva)

### Mensal

- [ ] Revisar problemas de segurança
- [ ] Atualizar dependências críticas
- [ ] Verificar performance (queries lentas, memory leaks)
- [ ] Revisar cobertura de testes
- [ ] Atualizar documentação

### Pré-Produção

- [ ] Variáveis de ambiente configuradas
- [ ] CORS restringido a domínios permitidos
- [ ] Senha do banco diferente de "root"
- [ ] Logging ativo e monitorável
- [ ] Backup automático do banco ativado
- [ ] SSL/TLS configurado
- [ ] Rate limiting implementado
- [ ] Testes de carga executados

---

## 📞 Contatos e Referências

- **Repositório:** https://github.com/Joao-Oiiveira/Projeto-Integrador
- **Desenvolvedor Principal:** João Vitor Barbosa de Oliveira
- **Tipo de Projeto:** TCC (Trabalho de Conclusão de Curso)
- **Banco de Dados:** Vide `/Banco de dados/DER.jpg`

---

## 📝 Log de Alterações

| Data | O quê | Por quem | Status |
|------|-------|----------|--------|
| 27/05/2026 | Documentação inicial criada | Claude | ✅ |

---

**Próxima revisão:** 03/06/2026

