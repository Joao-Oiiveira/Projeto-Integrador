# 🖥️ Guia de Setup Local - EduAccess

**Objetivo:** Rodar todo o projeto (Backend + Mobile + Web) localmente  
**Tempo Estimado:** 30-45 minutos  
**Última Atualização:** 27/05/2026

---

## ✅ Pré-Requisitos

### Windows/Mac/Linux Todos

```
☐ Git (https://git-scm.com/)
☐ Docker Desktop (https://www.docker.com/products/docker-desktop)
☐ VS Code + Extensões
☐ Postman ou Insomnia (para testar API)
```

### Backend (Java/Spring)

```
☐ JDK 21 (https://adoptium.net/)
☐ Gradle (automático com ./gradlew)
☐ MySQL 8.0+ OU Docker (mais fácil)
```

### Mobile (Flutter)

```
☐ Flutter SDK (https://flutter.dev/docs/get-started/install)
☐ Dart SDK (incluso no Flutter)
☐ Android Studio (para Android) OU Xcode (para iOS)
☐ Emulador configurado
```

### Frontend (React)

```
☐ Node.js 18+ (https://nodejs.org/)
☐ npm ou yarn
```

---

## 🚀 Opção A: Rodar com Docker Compose (RECOMENDADO)

### Passo 1: Preparar Ambiente

```bash
# Clonar repositório
git clone https://github.com/Joao-Oiiveira/Projeto-Integrador.git
cd Projeto-Integrador

# Copiar env
cp .env.example .env

# Verificar docker está rodando
docker --version
docker-compose --version
```

### Passo 2: Iniciar Containers

```bash
# Subir tudo (backend + database + frontend)
docker-compose up -d

# Verificar status
docker-compose ps
# Saída esperada:
# NAME                COMMAND             STATUS
# eduacess-mysql      docker-entrypoint   Up (healthy)
# eduacess-api        java -jar ...       Up (healthy)
# eduacess-web        npm run dev         Up

# Ver logs em tempo real
docker-compose logs -f backend
# Ou outro serviço:
docker-compose logs -f mysql
docker-compose logs -f frontend
```

### Passo 3: Testar

```bash
# Backend
curl -X GET http://localhost:8080/swagger-ui.html
# Esperado: HTML da página Swagger

# Database
mysql -h localhost -u eduacess -p -e "SHOW DATABASES;"
# Esperado: projeto_integrador listado

# Frontend
open http://localhost:3000
# Esperado: Aplicação React abre
```

### Passo 4: Parar Tudo

```bash
docker-compose down
# Com: docker-compose down -v  (remove volumes também)
```

---

## 🛠️ Opção B: Rodar Localmente (Desenvolvimento)

### Backend (Spring Boot)

#### Passo 1: Instalar MySQL Localmente

**Windows:**
```bash
# Usar chocolatey
choco install mysql

# Ou baixar: https://dev.mysql.com/downloads/mysql/
```

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

#### Passo 2: Criar Banco

```bash
# Conectar como root
mysql -u root -p

# Comando SQL:
CREATE DATABASE IF NOT EXISTS projeto_integrador;
CREATE USER 'eduacess'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON projeto_integrador.* TO 'eduacess'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Passo 3: Rodar Backend

```bash
cd DemoAPI/demo

# Windows
./gradlew.bat bootRun

# Mac/Linux
chmod +x ./gradlew
./gradlew bootRun

# Esperado:
# ... Tomcat started on port(s): 8080 (http)
# ... Started DemoApplication in X seconds

# Verificar
curl http://localhost:8080/swagger-ui.html
```

#### Passo 4: Testar Endpoints

```bash
# Login (sem JWT, agora está aberto)
curl -X POST http://localhost:8080/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"123456"}'

# Esperado: resposta JSON
```

---

### Mobile (Flutter)

#### Passo 1: Instalar Flutter

```bash
# Verificar se tá instalado
flutter doctor

# Se não tiver:
# Ir em https://flutter.dev/docs/get-started/install
# Depois:
flutter pub global activate fvm  # (opcional, mas recomendado)
```

#### Passo 2: Preparar Emulador/Device

**Android:**
```bash
# Abrir Android Studio
# Tools > Device Manager > Create Virtual Device

# Ou via CLI:
flutter emulators --launch Pixel_5_API_30

# Verificar dispositivos conectados
flutter devices
```

**iOS (Mac apenas):**
```bash
# Abrir Xcode
# Window > Devices and Simulators > + > Create New Simulator

# Ou via CLI:
open -a Simulator
xcrun simctl create "iPhone 14" com.apple.CoreSimulator.SimDeviceType.iPhone-14 com.apple.CoreSimulator.SimRuntime.iOS-16-4
```

#### Passo 3: Rodar App

```bash
cd Mobile/mobile

# Obter dependências
flutter pub get

# Rodar no emulador/device conectado
flutter run

# Esperado: App abre no emulador
```

#### Passo 4: Conectar ao Backend

**No emulador Android:**
```dart
// lib/servicos/api_service.dart
const String baseUrl = 'http://10.0.2.2:8080/api';
// 10.0.2.2 é o alias para localhost do emulador Android
```

**No simulador iOS:**
```dart
const String baseUrl = 'http://localhost:8080/api';
```

**No dispositivo físico:**
```dart
// Descobrir IP da máquina
// Windows: ipconfig
// Mac/Linux: ifconfig

const String baseUrl = 'http://192.168.1.XXX:8080/api';
```

---

### Frontend (React)

#### Passo 1: Instalar Dependências

```bash
cd eduacess-frontend

npm install
# Ou com yarn
yarn install
```

#### Passo 2: Rodar Dev Server

```bash
npm run dev
# Esperado:
#  VITE v4.3.9  ready in 250 ms
#  ➜  Local:   http://localhost:5173/
```

#### Passo 3: Acessar

```bash
open http://localhost:5173
# Esperado: App React abre
```

---

## 🔗 Testar Integração Backend + Frontend

### Passo 1: Garantir que Backend está rodando

```bash
curl -X GET http://localhost:8080/swagger-ui.html
# Status: 200 OK
```

### Passo 2: No React/Frontend

```javascript
// src/services/api.js
const API_URL = 'http://localhost:8080/api';

export async function getDisciplinas() {
  const response = await fetch(`${API_URL}/v1/disciplinas`);
  return response.json();
}
```

### Passo 3: Testar no Browser

```bash
# Abrir DevTools (F12)
# Console:
fetch('http://localhost:8080/api/v1/disciplinas')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente (.env)

```bash
# Backend
DB_HOST=localhost
DB_PORT=3306
DB_NAME=projeto_integrador
DB_USER=eduacess
DB_PASSWORD=password
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres
SERVER_PORT=8080
APP_ENVIRONMENT=dev

# Frontend
VITE_API_URL=http://localhost:8080/api

# Mobile
# Editar no código: lib/servicos/api_service.dart
```

### Logging Detalhado

**Backend:**
```properties
# application-dev.properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.com.example.demo=DEBUG
logging.level.org.springframework=INFO
```

**Frontend:**
```javascript
// Adicionar ao main.jsx
if (import.meta.env.DEV) {
  console.log('Development mode');
}
```

---

## 🐛 Troubleshooting

### "Port 3306 já está em uso (MySQL)"

```bash
# Windows
netstat -ano | findstr :3306
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3306
kill -9 <PID>

# Ou usar porta diferente
docker-compose.yml: "3307:3306"
```

### "Port 8080 já está em uso (Backend)"

```bash
# Mesma solução acima
# Ou mudar em application.properties
server.port=8081
```

### "Grade build falhando (Java)"

```bash
./gradlew clean
./gradlew build -x test
```

### "Flutter device não aparece"

```bash
flutter doctor
# Seguir instruções para resolver

# Reconectar device
flutter devices
```

### "CORS error no Frontend"

```bash
# Verificar se backend tem CORS configurado
# (Sprint 1 Task S1.2)

# Ou temporariamente no localhost:
# Usar extensão CORS no Chrome
```

### "MySQL não conecta via Docker"

```bash
# Verificar logs
docker-compose logs mysql

# Verificar credenciais em .env
# Ou resetar:
docker-compose down -v
docker-compose up
```

---

## 📋 Checklist - Setup Completo

### ✅ Backend Rodando

- [ ] `curl http://localhost:8080/swagger-ui.html` → 200 OK
- [ ] Database conectado (logs mostram)
- [ ] Sem erros na inicialização
- [ ] Endpoints respondendo (testar em Postman)

### ✅ Frontend Rodando

- [ ] `open http://localhost:5173` → Abre
- [ ] Sem erros no console
- [ ] Consegue fazer requisição ao backend
- [ ] UI carrega corretamente

### ✅ Mobile Rodando

- [ ] Emulador/device conectado (`flutter devices`)
- [ ] App inicia sem crash
- [ ] Consegue conectar ao backend (logs mostram)
- [ ] Navegar entre telas funciona

---

## 🔄 Workflow Típico de Desenvolvimento

### Manhã (Começar o dia)

```bash
# Terminal 1: Backend
cd DemoAPI/demo && ./gradlew bootRun

# Terminal 2: Frontend
cd eduacess-frontend && npm run dev

# Terminal 3: Mobile
cd Mobile/mobile && flutter run

# Pronto! Todas abas rodando
```

### Durante o Dia

```bash
# Fazer mudanças no código
# Código hot-reload automático (Flutter + React)

# Backend: Reiniciar manual se mudar dependências
Ctrl+C no terminal, ./gradlew bootRun de novo

# Frontend: Salvar arquivo, página auto-recarrega
# Mobile: Salvar arquivo, tela auto-recarrega
```

### Parar Tudo

```bash
# Terminal: Ctrl+C em cada
```

---

## 🎯 Próximas Passos

1. ✅ Setup completo funcionando
2. → Abra `00_COMECE_AQUI.md`
3. → Leia `PLANO_ACAO_DETALHADO.md` Sprint 1
4. → Comece Task S1.1 (Hash de Senha)

---

**Versão:** 1.0  
**Status:** ✅ Completo  
**Suporte:** Consulte MATRIZ_SUPERVISAO.md → Troubleshooting

