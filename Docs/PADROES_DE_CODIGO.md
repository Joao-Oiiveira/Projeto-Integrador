# 📐 Padrões de Código - EduAccess

**Objetivo:** Manter codebase consistente e profissional  
**Versão:** 1.0 | **Revisor:** Claude (IA Supervisor)

---

## 🎯 Princípios Gerais

```
1. Simplicidade > Complexidade
2. Claridade > Compactness
3. Consistência > Flexibilidade
4. Testing > Refactoring depois
5. Documentação > Adivinhar
```

---

## ☕ Backend Java/Spring Boot

### Nomeação

```java
// ✅ CORRETO
class UsuarioController { }           // PascalCase para classes
class usuario_service { }             // PascalCase preferido, snake_case evitar
private String nomeCompleto;          // camelCase para variáveis/métodos
private static final String CONFIG_KEY = "app.key"; // UPPER_SNAKE_CASE para constantes

// ❌ ERRADO
class usuario_controller { }
private String nome_completo;
private static final String configKey = "app.key";
```

### Estrutura de Pacotes

```
com.example.demo
├── controller          # Endpoints REST
│   ├── UsuarioController.java
│   ├── MateriaController.java
│   └── AgendaController.java
├── service             # Lógica de negócio
│   ├── UsuarioService.java
│   ├── MateriaService.java
│   └── AgendaService.java
├── repository          # Acesso a dados
│   ├── UsuarioRepository.java
│   ├── MateriaRepository.java
│   └── AgendaRepository.java
├── model               # Entidades JPA
│   ├── Usuario.java
│   ├── Materia.java
│   └── Agenda.java
├── dto                 # Transfer objects
│   ├── UsuarioDTO.java
│   ├── LoginDTO.java
│   └── MateriaDTO.java
├── exception           # Exceções customizadas
│   ├── EntityNotFoundException.java
│   └── InvalidCredentialsException.java
├── config              # Configurações
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── JpaConfig.java
└── DemoApplication.java
```

### Padrão DTO

```java
// ✅ CORRETO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
  @NotBlank(message = "Nome é obrigatório")
  private String nome;
  
  @Email(message = "Email inválido")
  private String email;
  
  // Apenas campos necessários (sem senha em GET)
  // Sem anotações JPA
}

// ❌ ERRADO - Expor entidade diretamente
@GetMapping("/{id}")
public Usuario obter(@PathVariable Long id) {
  return usuarioRepo.findById(id).orElse(null); // Retorna entidade
}
```

### Padrão Service

```java
// ✅ CORRETO
@Service
@Transactional
public class UsuarioService {
  @Autowired
  private UsuarioRepository usuarioRepo;
  
  @Autowired
  private PasswordEncoder passwordEncoder;
  
  // Business logic aqui, não no controller
  public UsuarioDTO criar(UsuarioDTO dto) {
    validar(dto);
    Usuario usuario = mapper.toEntity(dto);
    usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
    Usuario saved = usuarioRepo.save(usuario);
    return mapper.toDTO(saved);
  }
  
  private void validar(UsuarioDTO dto) {
    if (usuarioRepo.existsByEmail(dto.getEmail())) {
      throw new IllegalArgumentException("Email duplicado");
    }
  }
}

// ❌ ERRADO - Lógica no controller
@PostMapping
public Usuario criar(@RequestBody Usuario usuario) {
  // Validação, processamento aqui...
  return usuarioRepo.save(usuario);
}
```

### Padrão Controller

```java
// ✅ CORRETO
@RestController
@RequestMapping("/api/v1/usuarios")
@Slf4j
public class UsuarioController {
  @Autowired
  private UsuarioService usuarioService;
  
  @PostMapping
  public ResponseEntity<UsuarioDTO> criar(@Valid @RequestBody UsuarioDTO dto) {
    UsuarioDTO created = usuarioService.criar(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }
  
  @GetMapping("/{id}")
  public ResponseEntity<UsuarioDTO> obter(@PathVariable Long id) {
    Optional<UsuarioDTO> usuario = usuarioService.obterPorId(id);
    return usuario
      .map(ResponseEntity::ok)
      .orElseGet(() -> ResponseEntity.notFound().build());
  }
}

// ❌ ERRADO - Sem status apropriado, sem validação
@PostMapping
public Usuario criar(@RequestBody Usuario usuario) {
  return usuarioRepo.save(usuario); // 200 ao invés de 201
}
```

### Tratamento de Erros

```java
// ✅ CORRETO
@RestControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    Map<String, String> erros = new HashMap<>();
    e.getBindingResult().getFieldErrors().forEach(err -> 
      erros.put(err.getField(), err.getDefaultMessage())
    );
    return ResponseEntity.badRequest().body(erros);
  }
}

// ❌ ERRADO - Deixar exception vazar para cliente
@GetMapping("/{id}")
public Usuario obter(@PathVariable Long id) {
  return usuarioRepo.findById(id).get(); // NullPointerException vaza!
}
```

### Documentação (JavaDoc)

```java
// ✅ CORRETO
/**
 * Cria um novo usuário no sistema.
 *
 * @param dto Dados do usuário a ser criado
 * @return ResponseEntity contendo o usuário criado com status 201
 * @throws IllegalArgumentException se email já está cadastrado
 */
@PostMapping
public ResponseEntity<UsuarioDTO> criar(@Valid @RequestBody UsuarioDTO dto) {
  // ...
}

// ❌ ERRADO - Documentação genérica ou faltando
@PostMapping
public ResponseEntity<UsuarioDTO> criar(@RequestBody UsuarioDTO dto) {
  // Criar usuário
}
```

---

## 🎨 Frontend Flutter

Já documentado em `Boas praticas.txt`. Resumo:

### Nomeação

```dart
// ✅ CORRETO
class MaterialScreen extends StatefulWidget { }
final String nomeUsuario = "João";
const double PADDING_GRANDE = 16.0;
List<Materia> materias = [];

// ❌ ERRADO
class materiaScreen extends StatefulWidget { }
final String nome_usuario = "João";
const double paddingGrande = 16.0;
```

### Estrutura

```
lib/
├── main.dart
├── rotas.dart
├── models/                    # Classes de dados
│   ├── materia.dart
│   ├── tarefa.dart
│   └── usuario.dart
├── services/                  # API calls
│   ├── api_service.dart
│   ├── disciplinas_service.dart
│   └── auth_service.dart
├── screens/                   # Telas
│   ├── auth/
│   ├── menu/
│   └── calendario/
├── widgets/                   # Componentes
│   ├── custom_button.dart
│   └── custom_card.dart
├── theme/
│   ├── app_colors.dart
│   ├── app_text_styles.dart
│   └── app_theme.dart
└── utils/
    └── date_utils.dart
```

### Padrão Model

```dart
// ✅ CORRETO
class Materia {
  final String id;
  final String nome;
  final String cor;
  final int progresso;

  Materia({
    required this.id,
    required this.nome,
    required this.cor,
    required this.progresso,
  });

  factory Materia.fromJson(Map<String, dynamic> json) {
    return Materia(
      id: json['id'],
      nome: json['nome'],
      cor: json['cor'],
      progresso: json['progresso'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nome': nome,
      'cor': cor,
      'progresso': progresso,
    };
  }
}

// ❌ ERRADO - Sem fromJson/toJson
class Materia {
  String id, nome, cor;
  int progresso;
}
```

### Padrão Service

```dart
// ✅ CORRETO
class DisciplinasService {
  static const String baseUrl = 'http://localhost:8080/api';

  static Future<List<Materia>> getMaterias() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/v1/disciplinas'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final List json = jsonDecode(response.body);
        return json.map((item) => Materia.fromJson(item)).toList();
      } else {
        throw Exception('Erro ao carregar disciplinas');
      }
    } catch (e) {
      throw Exception('Erro de rede: $e');
    }
  }
}

// ❌ ERRADO - Sem try-catch, sem logging
class DisciplinasService {
  static Future<List<Materia>> getMaterias() async {
    final response = await http.get(Uri.parse(...));
    return jsonDecode(response.body);
  }
}
```

---

## 🌐 Frontend React

### Nomeação

```javascript
// ✅ CORRETO
const UserProfile = () => { }      // PascalCase para componentes
const fetchUserData = async () => { }  // camelCase para funções
const MAX_RETRIES = 3;               // UPPER_SNAKE_CASE para constantes
const [userData, setUserData] = useState(null); // camelCase para hooks

// ❌ ERRADO
const user_profile = () => { }
const FetchUserData = async () => { }
const max_retries = 3;
```

### Estrutura

```
src/
├── components/             # UI reutilizáveis
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Button.jsx
│   └── Card.jsx
├── pages/                  # Rotas/páginas
│   ├── HomePage.jsx
│   ├── DisciplinasPage.jsx
│   └── AgendaPage.jsx
├── hooks/                  # Custom hooks
│   ├── useFetch.js
│   ├── useForm.js
│   └── useAuth.js
├── services/               # API calls
│   ├── api.js
│   └── endpoints.js
├── context/                # State management
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── utils/                  # Utilitários
│   ├── validators.js
│   └── formatters.js
├── styles/                 # CSS
│   ├── global.css
│   └── components.css
├── App.jsx
└── main.jsx
```

### Padrão Componente

```jsx
// ✅ CORRETO
import PropTypes from 'prop-types';

export function UserCard({ user, onDelete }) {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={onDelete}>Deletar</button>
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

// ❌ ERRADO - Sem PropTypes, lógica complexa
export function userCard(props) {
  // Lógica misturada com JSX
  return <div>{JSON.stringify(props)}</div>;
}
```

### Padrão Hook

```javascript
// ✅ CORRETO
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setData(data);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, loading, error };
}

// ❌ ERRADO - Memory leak, sem cleanup
export function useFetch(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]); // Sem return cleanup
}
```

---

## 🧪 Testes

### Backend (JUnit 5)

```java
// ✅ CORRETO
@SpringBootTest
class UsuarioServiceTest {
  
  @MockBean
  private UsuarioRepository usuarioRepo;
  
  @Autowired
  private UsuarioService usuarioService;
  
  @Test
  @DisplayName("Deve criar usuário com dados válidos")
  void deveCriarUsuarioComDadosValidos() {
    // Arrange
    UsuarioDTO dto = UsuarioDTO.builder()
      .nome("João")
      .email("joao@test.com")
      .build();
    
    // Act
    UsuarioDTO resultado = usuarioService.criar(dto);
    
    // Assert
    assertThat(resultado).isNotNull();
    assertThat(resultado.getEmail()).isEqualTo("joao@test.com");
  }
}

// ❌ ERRADO - Nome genérico, sem arrange-act-assert
@Test
void test() {
  usuarioService.criar(new UsuarioDTO());
  // Sem assert
}
```

---

## 📝 Comentários

### Quando Comentar

```java
// ✅ CORRETO - WHY não óbvio
// Usar índice -1 porque API retorna índice 0 para não encontrado
int index = resultado.indexOf(valor) + 1;

// ❌ ERRADO - O QUE é óbvio
// Incrementar índice
int index = resultado.indexOf(valor) + 1;

// ✅ CORRETO - Workaround
// Workaround para bug em versão X do framework Y
// (Remover quando atualizar para versão Z)
if (System.getProperty("os.name").contains("Windows")) {
  // ...
}

// ❌ ERRADO - Comentário TODO sem contexto
// TODO: melhorar performance
List<Materia> materias = repo.findAll();
```

---

## 🚀 Commits Git

```bash
# ✅ CORRETO - Imperativo, descritivo
git commit -m "Add password hashing with BCrypt (Task S1.1)"
git commit -m "Fix CORS configuration for development"
git commit -m "Refactor UsuarioService to use DTOs"

# ❌ ERRADO - Passado, genérico, sem contexto
git commit -m "Added things"
git commit -m "fixed bug"
git commit -m "WIP"
```

---

## 📊 Resumo

| Aspecto | Padrão | Exemplo |
|---------|--------|---------|
| **Classe Java** | PascalCase | `UsuarioController` |
| **Variável Java** | camelCase | `nomeUsuario` |
| **Constante Java** | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| **Componente React** | PascalCase | `UserCard` |
| **Função Dart** | camelCase | `getMaterias()` |
| **Arquivo Dart** | snake_case | `user_service.dart` |
| **Branch Git** | kebab-case | `feature/s1.1-bcrypt` |

---

**Versão:** 1.0 Completo  
**Data:** 27/05/2026  
**Revisor:** Claude

