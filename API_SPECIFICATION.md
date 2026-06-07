# 📡 Especificação de API - EduAccess

**Versão:** 1.0 | **Base URL:** `http://localhost:8080/api` | **Documentação Automática:** `/swagger-ui.html`

---

## 🔐 Autenticação

Após implementar JWT (Sprint 1, Task S1.4):

```bash
# Header obrigatório em todos requests
Authorization: Bearer <token>

# Exemplo:
curl -X GET http://localhost:8080/api/v1/usuarios/123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

---

## 👤 Usuários (`/api/v1/usuarios`)

### 1. Cadastro

**Endpoint:** `POST /api/v1/usuarios/cadastro`

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "Senha123!",
  "dataNascimento": "2000-05-15",
  "tipoDeficiencia": "TDAH"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "dataNascimento": "2000-05-15",
  "tipoDeficiencia": "TDAH"
}
```

**Possíveis Erros:**
- `400 Bad Request` - Email inválido ou duplicado
- `422 Unprocessable Entity` - Validação falhou

---

### 2. Login

**Endpoint:** `POST /api/v1/usuarios/login`

**Request:**
```json
{
  "email": "joao@example.com",
  "senha": "Senha123!"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenExpiration": 86400000
}
```

**Possíveis Erros:**
- `401 Unauthorized` - Email ou senha incorretos
- `404 Not Found` - Usuário não existe

---

### 3. Obter Perfil

**Endpoint:** `GET /api/v1/usuarios/{id}`

**Header:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "dataNascimento": "2000-05-15",
  "tipoDeficiencia": "TDAH",
  "dataCriacao": "2026-05-27T10:30:00"
}
```

**Possíveis Erros:**
- `401 Unauthorized` - Token inválido/expirado
- `403 Forbidden` - Tentando acessar perfil de outro usuário
- `404 Not Found` - Usuário não existe

---

### 4. Atualizar Perfil

**Endpoint:** `PUT /api/v1/usuarios/{id}`

**Header:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nome": "João Silva Santos",
  "tipoDeficiencia": "DISLEXIA",
  "dataNascimento": "2000-05-15"
}
```

**Response (200 OK):** (mesmo formato do GET)

---

### 5. Deletar Conta

**Endpoint:** `DELETE /api/v1/usuarios/{id}`

**Header:** `Authorization: Bearer <token>`

**Response (204 No Content)** - Sem body

---

## 📚 Disciplinas (`/api/v1/disciplinas`)

### 1. Listar Disciplinas do Usuário

**Endpoint:** `GET /api/v1/disciplinas`

**Query Params:**
```
?page=0&size=10&sort=nome,asc
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "nome": "Matemática",
      "cor": "#FF5733",
      "descricao": "Álgebra e Geometria",
      "progresso": 45,
      "usuarioId": 1,
      "dataCriacao": "2026-05-20T14:30:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0
}
```

---

### 2. Obter Disciplina

**Endpoint:** `GET /api/v1/disciplinas/{id}`

**Response (200 OK):**
```json
{
  "id": 1,
  "nome": "Matemática",
  "cor": "#FF5733",
  "descricao": "Álgebra e Geometria",
  "progresso": 45,
  "usuarioId": 1
}
```

---

### 3. Criar Disciplina

**Endpoint:** `POST /api/v1/disciplinas`

**Request:**
```json
{
  "nome": "Física",
  "cor": "#3366FF",
  "descricao": "Mecânica e Termodinâmica"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "nome": "Física",
  "cor": "#3366FF",
  "descricao": "Mecânica e Termodinâmica",
  "progresso": 0,
  "usuarioId": 1,
  "dataCriacao": "2026-05-27T15:00:00"
}
```

---

### 4. Importar Disciplina (JSON)

**Endpoint:** `POST /api/v1/disciplinas/importar`

**Request (form-data):**
```
file: arquivo.json (multipart)
```

**JSON esperado (arquivo.json):**
```json
{
  "disciplinas": [
    {
      "nome": "Química",
      "cor": "#00AA00",
      "descricao": "Química Geral"
    }
  ]
}
```

**Response (201 Created):** Array de disciplinas criadas

---

### 5. Atualizar Disciplina

**Endpoint:** `PUT /api/v1/disciplinas/{id}`

**Request:**
```json
{
  "nome": "Matemática Avançada",
  "cor": "#FF5733",
  "descricao": "Cálculo e Análise"
}
```

**Response (200 OK):** Disciplina atualizada

---

### 6. Deletar Disciplina

**Endpoint:** `DELETE /api/v1/disciplinas/{id}`

**Response (204 No Content)**

---

## 📅 Agenda (`/api/v1/agenda`)

### 1. Listar Tarefas/Eventos

**Endpoint:** `GET /api/v1/agenda?tipo=TAREFA`

**Query Params:**
```
tipo: TAREFA|EVENTO
dataInicio: 2026-05-01
dataFim: 2026-05-31
disciplinaId: 1 (opcional)
status: PENDENTE|CONCLUIDA (opcional)
```

**Response (200 OK):**
```json
{
  "tarefas": [
    {
      "id": 1,
      "titulo": "Estudar Capítulo 3",
      "descricao": "Ler páginas 45-67",
      "dataVencimento": "2026-06-01T23:59:00",
      "status": "PENDENTE",
      "disciplinaId": 1,
      "prioridade": "ALTA"
    }
  ],
  "eventos": [
    {
      "id": 10,
      "titulo": "Prova de Matemática",
      "dataHora": "2026-06-02T14:00:00",
      "local": "Sala 101"
    }
  ]
}
```

---

### 2. Criar Tarefa

**Endpoint:** `POST /api/v1/agenda/tarefas`

**Request:**
```json
{
  "titulo": "Fazer exercícios",
  "descricao": "Exercícios 1-20 do livro",
  "dataVencimento": "2026-06-05T23:59:00",
  "disciplinaId": 1,
  "prioridade": "MEDIA"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "titulo": "Fazer exercícios",
  "descricao": "Exercícios 1-20 do livro",
  "dataVencimento": "2026-06-05T23:59:00",
  "status": "PENDENTE",
  "disciplinaId": 1,
  "prioridade": "MEDIA",
  "dataCriacao": "2026-05-27T16:00:00"
}
```

---

### 3. Marcar Tarefa como Concluída

**Endpoint:** `PUT /api/v1/agenda/tarefas/{id}/concluir`

**Request:** (sem body)

**Response (200 OK):** Tarefa com status = "CONCLUIDA"

---

### 4. Criar Evento

**Endpoint:** `POST /api/v1/agenda/eventos`

**Request:**
```json
{
  "titulo": "Prova Final",
  "dataHora": "2026-06-15T14:00:00",
  "local": "Auditório Principal",
  "disciplinaId": 1
}
```

**Response (201 Created):** Evento criado

---

## 🎴 Flashcards (`/api/v1/flashcards`)

### 1. Listar Conjuntos

**Endpoint:** `GET /api/v1/flashcards/conjuntos`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "Tabuada",
    "descricao": "Memorizar multiplicação",
    "disciplinaId": 1,
    "totalCartoes": 15,
    "proximo ": "2026-05-28T10:00:00"
  }
]
```

---

### 2. Criar Conjunto

**Endpoint:** `POST /api/v1/flashcards/conjuntos`

**Request:**
```json
{
  "nome": "Verbos em Inglês",
  "descricao": "Conjugação de verbos",
  "disciplinaId": 1
}
```

**Response (201 Created):** Conjunto criado

---

### 3. Adicionar Cartão

**Endpoint:** `POST /api/v1/flashcards/conjuntos/{conjuntoId}/cartoes`

**Request:**
```json
{
  "pergunta": "Qual é a capital da França?",
  "resposta": "Paris"
}
```

**Response (201 Created):** Cartão criado

---

### 4. Obter Próximos Cartões para Revisar

**Endpoint:** `GET /api/v1/flashcards/revisar?conjuntoId=1`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "pergunta": "Qual é a capital da França?",
    "resposta": "Paris",
    "acertos": 3,
    "erros": 1,
    "proximoRevisao": "2026-05-28T14:00:00"
  }
]
```

---

### 5. Registrar Resposta

**Endpoint:** `PUT /api/v1/flashcards/cartoes/{cartaoId}/responder`

**Request:**
```json
{
  "acertou": true
}
```

**Response (200 OK):** Cartão atualizado com novo agendamento

---

## ❓ Questões (`/api/v1/questoes`)

### 1. Listar Questões

**Endpoint:** `GET /api/v1/questoes?disciplinaId=1&dificuldade=MEDIA`

**Query Params:**
```
disciplinaId: 1
dificuldade: FACIL|MEDIA|DIFICIL
tipo: MULTIPLA_ESCOLHA|VERDADEIRO_FALSO
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "enunciado": "O que é fotossíntese?",
    "tipo": "MULTIPLA_ESCOLHA",
    "dificuldade": "MEDIA",
    "disciplinaId": 1,
    "opcoes": [
      {"id": 1, "texto": "Processo de respiração"},
      {"id": 2, "texto": "Síntese de luz em energia"},
      {"id": 3, "texto": "Absorção de luz para produzir energia"}
    ],
    "respostaCorretaId": 3
  }
]
```

---

### 2. Criar Questão

**Endpoint:** `POST /api/v1/questoes`

**Request:**
```json
{
  "enunciado": "Qual é a fórmula da água?",
  "tipo": "MULTIPLA_ESCOLHA",
  "dificuldade": "FACIL",
  "disciplinaId": 1,
  "opcoes": [
    {"texto": "H2O", "correta": true},
    {"texto": "O2H", "correta": false},
    {"texto": "H2O2", "correta": false}
  ]
}
```

**Response (201 Created):** Questão criada

---

### 3. Responder Questão

**Endpoint:** `PUT /api/v1/questoes/{questaoId}/responder`

**Request:**
```json
{
  "opcaoSelecionadaId": 1
}
```

**Response (200 OK):**
```json
{
  "acertou": true,
  "respostaCorreta": "H2O",
  "explicacao": "A água é composta de 2 átomos de hidrogênio e 1 de oxigênio"
}
```

---

## 🤖 IA (Planejado para Sprint 5+)

**Endpoint:** `POST /api/v1/ia/gerar-resumo`

```json
{
  "disciplinaId": 1,
  "conteudo": "Texto sobre fotossíntese...",
  "nivel": "BASICO|INTERMEDIARIO|AVANCADO"
}
```

**Response:**
```json
{
  "resumo": "Fotossíntese é o processo...",
  "pontos_chave": ["Ponto 1", "Ponto 2"],
  "flashcards_gerados": [...]
}
```

---

## 📊 Respostas Padrão

### Sucesso (200-201)
```json
{
  "data": {...},
  "message": "Operação realizada com sucesso",
  "timestamp": "2026-05-27T16:00:00"
}
```

### Erro de Validação (400)
```json
{
  "status": 400,
  "message": "Validação falhou",
  "errors": {
    "email": "Email é obrigatório",
    "senha": "Senha deve ter no mínimo 8 caracteres"
  },
  "timestamp": "2026-05-27T16:00:00"
}
```

### Não Autorizado (401)
```json
{
  "status": 401,
  "message": "Token inválido ou expirado",
  "timestamp": "2026-05-27T16:00:00"
}
```

### Não Encontrado (404)
```json
{
  "status": 404,
  "message": "Recurso não encontrado",
  "timestamp": "2026-05-27T16:00:00"
}
```

### Erro Interno (500)
```json
{
  "status": 500,
  "message": "Erro interno do servidor",
  "timestamp": "2026-05-27T16:00:00"
}
```

---

## 🧪 Exemplos com Curl

### Cadastro

```bash
curl -X POST http://localhost:8080/api/v1/usuarios/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "email": "joao@test.com",
    "senha": "Senha123!",
    "dataNascimento": "2000-05-15",
    "tipoDeficiencia": "NENHUMA"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@test.com",
    "senha": "Senha123!"
  }'
```

### Criar Disciplina (com token)

```bash
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X POST http://localhost:8080/api/v1/disciplinas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Matemática",
    "cor": "#FF5733",
    "descricao": "Álgebra"
  }'
```

---

**Status:** ✅ Completo até Sprint 3  
**Swagger:** Acessível em `/swagger-ui.html` após Sprint 2  
**Próximas APIs:** IA (Sprint 5+)

