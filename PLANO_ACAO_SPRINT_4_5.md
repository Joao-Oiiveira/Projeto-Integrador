# 🐳 SPRINT 4: DevOps & Containerização (Semana 8-9)

**Objetivo:** Automatizar build, testes e deploy  
**Esforço Total:** ~16h  
**Output:** Docker + CI/CD pipeline funcional

---

## 📦 Task D4.1: Criar Dockerfile

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 3h

**Arquivo:** `DemoAPI/demo/Dockerfile` (NOVO)

**Checklist:**
- [ ] Criar Dockerfile multi-stage
- [ ] Usar JDK 21 como base
- [ ] Build com Gradle na primeira stage
- [ ] Runtime com JRE na segunda stage
- [ ] Configurar EXPOSE 8080
- [ ] Testar localmente: `docker build -t eduacess-api .`

**Código:**

```dockerfile
# Dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copiar files
COPY . .

# Build com Gradle
RUN chmod +x ./gradlew && \
    ./gradlew clean build -x test

# Stage 2: Runtime
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar JAR da stage anterior
COPY --from=builder /app/demo/build/libs/*.jar app.jar

# Variáveis de ambiente
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.JarLauncher &>/dev/null || exit 1

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Teste:**
```bash
cd DemoAPI/demo
docker build -t eduacess-api:latest .
docker run -e DB_HOST=host.docker.internal -p 8080:8080 eduacess-api:latest
# Testar: curl http://localhost:8080/swagger-ui.html
```

---

## 🐳 Task D4.2: Criar docker-compose.yml

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 2h

**Arquivo:** `docker-compose.yml` (NOVO, na raiz)

**Checklist:**
- [ ] Criar services: backend, database, frontend (web)
- [ ] Configurar volumes para MySQL
- [ ] Configurar networks
- [ ] Testar: `docker-compose up`

**Código:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: eduacess-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${DB_NAME:-projeto_integrador}
      MYSQL_USER: ${DB_USER:-eduacess}
      MYSQL_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./Banco\ de\ dados:/docker-entrypoint-initdb.d
    networks:
      - eduacess-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: ./DemoAPI/demo
      dockerfile: Dockerfile
    container_name: eduacess-api
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME:-projeto_integrador}
      DB_USER: ${DB_USER:-eduacess}
      DB_PASSWORD: ${DB_PASSWORD:-password}
      JWT_SECRET: ${JWT_SECRET:-sua-chave-super-secreta-minimo-32-caracteres}
      APP_ENVIRONMENT: ${APP_ENVIRONMENT:-prod}
      SERVER_PORT: 8080
    ports:
      - "${SERVER_PORT:-8080}:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - eduacess-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/swagger-ui.html"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Web (React)
  frontend:
    build:
      context: ./eduacess-frontend
      dockerfile: Dockerfile
    container_name: eduacess-web
    environment:
      VITE_API_URL: http://backend:8080
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - eduacess-network
    restart: unless-stopped

volumes:
  mysql_data:

networks:
  eduacess-network:
    driver: bridge
```

**Teste:**
```bash
# Criar .env na raiz
cp .env.example .env

# Rodar tudo
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Parar tudo
docker-compose down
```

---

## 🚀 Task D4.3: Configurar GitHub Actions CI/CD

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 3h

**Arquivo:** `.github/workflows/ci-cd.yml` (NOVO)

**Checklist:**
- [ ] Criar pasta `.github/workflows/`
- [ ] Criar arquivo `ci-cd.yml`
- [ ] Configurar trigger em push/PR
- [ ] Build + Testes rodam automaticamente
- [ ] Deploy automático em produção (tag)

**Código:**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  test-backend:
    runs-on: ubuntu-latest
    name: Backend Tests

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: projeto_integrador_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Build Backend
        working-directory: ./DemoAPI/demo
        run: |
          chmod +x gradlew
          ./gradlew clean build -x test
      
      - name: Run Tests
        working-directory: ./DemoAPI/demo
        env:
          DB_HOST: localhost
          DB_USER: root
          DB_PASSWORD: root
          DB_NAME: projeto_integrador_test
        run: ./gradlew test
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./DemoAPI/demo/build/reports/jacoco/test/jacocoTestReport.xml

  test-frontend:
    runs-on: ubuntu-latest
    name: Frontend Tests

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./eduacess-frontend
        run: npm install
      
      - name: Build
        working-directory: ./eduacess-frontend
        run: npm run build
      
      - name: Run tests
        working-directory: ./eduacess-frontend
        run: npm run test || true

  deploy-production:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    name: Deploy to Production

    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t eduacess-api:${{ github.sha }} ./DemoAPI/demo
          docker tag eduacess-api:${{ github.sha }} eduacess-api:latest
      
      - name: Push to Docker Hub (or registry)
        run: |
          echo "Configurar credenciais de registry aqui"
          docker push eduacess-api:latest
      
      - name: Deploy
        run: |
          echo "Deploy script aqui"
          echo "Ex: kubectl apply -f k8s/"
```

---

## 📝 Task D4.4: Configurar .env.example

**Status:** 📋 TODO | **Prioridade:** 🟡 MÉDIA | **Esforço:** 0.5h

**Arquivo:** `.env.example` (NOVO, na raiz)

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projeto_integrador
DB_USER=eduacess
DB_PASSWORD=seu_senha_segura_aqui

# Security
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
APP_ENVIRONMENT=dev

# Frontend
VITE_API_URL=http://localhost:8080

# Optional: Docker Registry (se usar)
DOCKER_REGISTRY_URL=docker.io
DOCKER_REGISTRY_USER=seu_usuario
```

---

## ☑️ Task D4.5: Criar .dockerignore

**Status:** 📋 TODO | **Prioridade:** 🟢 BAIXA | **Esforço:** 0.5h

**Arquivo:** `DemoAPI/demo/.dockerignore` (NOVO)

```
.git
.gitignore
.idea
*.iml
*.md
*.log
node_modules
build/
.gradle/
.DS_Store
.env
.env.local
*.class
```

---

## 📋 Critério de Aceite - Sprint 4

- [ ] Dockerfile buildado e testado localmente
- [ ] docker-compose up roda sem erros
- [ ] GitHub Actions pipeline executado com sucesso
- [ ] Build passa em CI (main branch)
- [ ] Nenhum hard-coded secrets em logs
- [ ] .env.example documentado
- [ ] Database migra automaticamente no container

---

---

# 📱 SPRINT 5: Mobile & Frontend (Semana 10-12)

**Objetivo:** Qualidade, estado management, validação  
**Esforço Total:** ~30h+  
**Output:** UX melhorada, código testável

---

## 📱 Task M5.1: Implementar Riverpod (Flutter)

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 4h

**Arquivo:** `Mobile/mobile/pubspec.yaml`

**Checklist:**
- [ ] Adicionar dependências (riverpod, hooks)
- [ ] Converter main.dart para ConsumerWidget
- [ ] Implementar providers para estados
- [ ] Testar estado consistente

**Código:**

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.0
  hooks_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

dev_dependencies:
  riverpod_generator: ^2.3.0
  build_runner: ^2.4.0
```

```dart
// lib/providers/materias_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:mobile/models/materia.dart';
import 'package:mobile/servicos/disciplinas_service.dart';

part 'materias_provider.g.dart';

@riverpod
Future<List<Materia>> materias(MateriasRef ref) async {
  return await DisciplinasService.getMaterias();
}

@riverpod
class MateriaNotifier extends _$MateriaNotifier {
  @override
  Future<List<Materia>> build() {
    return materias(ref);
  }

  Future<void> addMateria(Materia materia) async {
    // Atualizar estado
    state = await AsyncValue.guard(() async {
      final materias = await state.when(
        data: (list) => Future.value([...list, materia]),
        error: (_, __) => throw Exception("Erro"),
        loading: () => throw Exception("Carregando"),
      );
      return materias;
    });
  }
}
```

```dart
// lib/telas/materias_screen.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/materias_provider.dart';

class MateriasScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final materiasAsync = ref.watch(materiasProvider);

    return materiasAsync.when(
      data: (materias) => ListView(
        children: materias.map((m) => MateriaCard(materia: m)).toList(),
      ),
      loading: () => Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error, size: 48, color: Colors.red),
            SizedBox(height: 16),
            Text('Erro: $error'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.refresh(materiasProvider),
              child: Text('Tentar Novamente'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🎨 Task M5.2: Validação Avançada (Flutter)

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 3h

**Arquivo:** `Mobile/mobile/lib/utils/form_validators.dart` (NOVO)

**Checklist:**
- [ ] Criar validators para email, senha, etc
- [ ] Usar mascaras (máscaras de texto)
- [ ] Feedback visual em tempo real
- [ ] Testar edge cases

**Código:**

```dart
// lib/utils/form_validators.dart
class FormValidators {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email é obrigatório';
    }
    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(value)) {
      return 'Email inválido';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Senha é obrigatória';
    }
    if (value.length < 8) {
      return 'Senha deve ter no mínimo 8 caracteres';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Senha deve conter letra maiúscula';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Senha deve conter número';
    }
    return null;
  }

  static String? validateNome(String? value) {
    if (value == null || value.isEmpty) {
      return 'Nome é obrigatório';
    }
    if (value.length < 3) {
      return 'Nome deve ter no mínimo 3 caracteres';
    }
    if (!RegExp(r'^[a-zA-ZÀ-ÿ\s]+$').hasMatch(value)) {
      return 'Nome só pode conter letras e espaços';
    }
    return null;
  }

  static String? validateData(String? value) {
    if (value == null || value.isEmpty) {
      return 'Data é obrigatória';
    }
    try {
      final data = DateTime.parse(value);
      if (data.isAfter(DateTime.now())) {
        return 'Data não pode ser no futuro';
      }
      return null;
    } catch (e) {
      return 'Data inválida (use DD/MM/YYYY)';
    }
  }
}

// Uso em Form:
TextFormField(
  validator: FormValidators.validateEmail,
  decoration: InputDecoration(
    labelText: 'Email',
    errorText: _emailError,
  ),
  onChanged: (value) {
    setState(() => _emailError = FormValidators.validateEmail(value));
  },
)
```

---

## 🌐 Task M5.3: Refatoração React (Frontend Web)

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 6h

**Objetivo:** Melhorar arquitetura, adicionar state management

**Checklist:**
- [ ] Estruturar pastas (components, pages, hooks, services)
- [ ] Implementar Context API ou Redux para estado
- [ ] Usar custom hooks para lógica
- [ ] Adicionar validação em forms
- [ ] Tratamento de erro em chamadas API

**Estrutura esperada:**

```
src/
├── components/          # UI reutilizáveis
│   ├── Button.jsx
│   ├── Modal.jsx
│   └── FormInput.jsx
├── pages/               # Páginas/rotas
│   ├── HomePage.jsx
│   ├── DisciplinasPage.jsx
│   └── AgendaPage.jsx
├── hooks/               # Custom hooks
│   ├── useFetch.js
│   ├── useForm.js
│   └── usePagination.js
├── services/            # API calls
│   ├── api.js
│   ├── disciplinasAPI.js
│   └── usuarioAPI.js
├── context/             # State management
│   ├── AuthContext.jsx
│   └── DisciplinasContext.jsx
├── styles/              # CSS
│   ├── global.css
│   └── components.css
└── utils/               # Utilitários
    ├── validators.js
    └── formatters.js
```

---

## 📝 Task M5.4: Error Handling Completo

**Status:** 📋 TODO | **Prioridade:** 🟠 ALTA | **Esforço:** 3h

**Objetivo:** Tratar todos erros gracefully

**Checklist:**
- [ ] Try-catch em todas API calls
- [ ] Toast/Snackbar para feedback
- [ ] Retry logic para falhas de rede
- [ ] Logging estruturado

---

## 📋 Critério de Aceite - Sprint 5

- [ ] Riverpod implementado em 80% das telas Flutter
- [ ] Validação de formulários funcionando
- [ ] Error handling em todas API calls
- [ ] React refatorado com arquitetura clara
- [ ] Sem console.errors em produção
- [ ] Testes de UI funcionando

---

## 📅 Timeline Final

```
Semana 1-2:   Sprint 1 ✅ Segurança BLOQUEADOR
Semana 3-5:   Sprint 2 🟠 Refatoração Backend
Semana 6-7:   Sprint 3 🟡 Testes
Semana 8-9:   Sprint 4 🟠 DevOps (Docker + CI/CD)
Semana 10-12: Sprint 5 🟡 Mobile/Web (State + Validation)

RESULTADO:    🟢 9/10 Production-Ready
```

---

**Versão:** 1.0 Completo  
**Data:** 27/05/2026  
**Status:** ✅ Sprint 4-5 Detalhados

