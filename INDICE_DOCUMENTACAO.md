# 📑 Índice de Documentação - EduAccess

**Versão:** 1.0 | **Data:** 27/05/2026 | **Atualizado em:** [MANTER ATUALIZADO]

---

## 🎯 Documentos Essenciais (em ordem de leitura)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  SUPERVISOR_GUIA_DE_USO.md                                   │
│     📍 COMECE AQUI - como usar todo o sistema                  │
│     ⏱️ 5-10 minutos                                             │
│     👉 Leia primeiro para entender tudo                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣  DOCUMENTACAO_TECNICA.md                                     │
│     📍 Visão geral, stack, arquitetura, problemas              │
│     ⏱️ 15 minutos (skim depois de ler 1️⃣)                      │
│     👉 Quando: entender projeto, explicar para alguém         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣  PLANO_ACAO_DETALHADO.md                                    │
│     📍 Sprint 1-5, tarefas específicas com código              │
│     ⏱️ Consulta contínua durante desenvolvimento              │
│     👉 Quando: começar task, precisar de código exemplo       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣  CODE_REVIEW_GUIDE.md                                       │
│     📍 Checklists, bloqueadores, padrões de revisão            │
│     ⏱️ 5 minutos por PR (consultá-lo durante review)          │
│     👉 Quando: revisar PR, antes de mergear                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 5️⃣  MATRIZ_SUPERVISAO.md                                       │
│     📍 Checklist semanal, métricas, alertas                   │
│     ⏱️ 15-20 minutos toda segunda-feira                       │
│     👉 Quando: segunda-feira, fim de sprint, emergência       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Documentos

```
Projeto-Integrador/
│
├── 📄 SUPERVISOR_GUIA_DE_USO.md .............. [LEIA PRIMEIRO]
│   └─ Como usar todos os documentos, fluxo de trabalho
│
├── 📄 DOCUMENTACAO_TECNICA.md ............... [VISÃO GERAL]
│   ├─ Seção 1: Visão Geral (2 min)
│   ├─ Seção 2: Arquitetura (5 min)
│   ├─ Seção 3: Estrutura (skim)
│   ├─ Seção 4: Guia de Desenvolvimento (consulta)
│   └─ Seção 5-6: Problemas & Melhorias (IMPORTANTE)
│
├── 📄 PLANO_ACAO_DETALHADO.md .............. [IMPLEMENTAÇÃO]
│   ├─ Task S1.1: Hash de Senha (4h)
│   ├─ Task S1.2: CORS Restringido (2h)
│   ├─ Task S1.3: Variáveis de Ambiente (1.5h)
│   ├─ Task S1.4: JWT Authentication (6h)
│   ├─ Task S1.5: Controle de Acesso (3h)
│   ├─ Task A2.1 - A2.5: Refatoração Backend
│   ├─ Task Q3.1 - Q3.n: Testes
│   └─ Sprints 4-5: DevOps, Mobile, Web
│
├── 📄 CODE_REVIEW_GUIDE.md ................. [QUALIDADE]
│   ├─ Seção 1: Checklist de Review (USAR SEMPRE)
│   ├─ Seção 2: Bloqueadores (REJEITAR SE VER)
│   ├─ Seção 3: Sugestões (comentários úteis)
│   └─ Seção 4: Templates de Comentários
│
├── 📄 MATRIZ_SUPERVISAO.md ................. [ACOMPANHAMENTO]
│   ├─ Dashboard de Status (overview)
│   ├─ Checklist Semanal (15 min)
│   ├─ Checklist Mensal (20 min)
│   ├─ Alertas (ação imediata)
│   ├─ OKRs do Projeto
│   └─ Troubleshooting (quando problema)
│
├── 📄 README.md ............................ [já existia]
├── 📄 ANALISE.md ........................... [já existia]
├── 📄 Boas praticas.txt .................... [já existia]
│
├── DemoAPI/ ............................... [Backend Java/Spring]
│   └── demo/src/main/java/com/example/demo/
│       ├─ controller/ → Use DOCUMENTACAO_TECNICA seção 5
│       ├─ model/
│       ├─ repository/
│       └─ (DTOs, Services virão em Sprint 2)
│
├── Mobile/ ................................ [Frontend Flutter]
│   └── mobile/lib/
│       ├─ main.dart
│       ├─ telas/ → Consulte Boas praticas.txt
│       ├─ servicos/
│       └─ tema/
│
├── eduacess-frontend/ ..................... [Frontend Web React]
│   └── src/
│       ├─ components/
│       ├─ pages/
│       ├─ services/
│       └─ (auditoria em Sprint 5)
│
└── Banco de dados/
    └─ (DER, scripts SQL)
```

---

## 🔍 Como Encontrar Informações

### "Preciso entender [X]"

| Preciso entender... | Documento | Seção |
|---------------------|-----------|-------|
| **O projeto** | DOCUMENTACAO_TECNICA | 1. Visão Geral |
| **A arquitetura** | DOCUMENTACAO_TECNICA | 2. Arquitetura |
| **O stack de tech** | DOCUMENTACAO_TECNICA | 2. Stack |
| **Pastas do projeto** | DOCUMENTACAO_TECNICA | 3. Estrutura |
| **O quê está ruim** | DOCUMENTACAO_TECNICA | 5. Problemas |
| **Como codar** | Boas praticas.txt (Flutter) | Seções 1-10 |
| **Padrões de review** | CODE_REVIEW_GUIDE | Seção 1 |
| **Tarefas específicas** | PLANO_ACAO_DETALHADO | Sprint específica |
| **Código de exemplo** | PLANO_ACAO_DETALHADO | Task específica |
| **Saúde do projeto** | MATRIZ_SUPERVISAO | Dashboard |

---

## 📌 Referência Rápida por Rol

### 👨‍💻 Desenvolvedor Backend

**Ler:**
1. SUPERVISOR_GUIA_DE_USO.md (overview)
2. DOCUMENTACAO_TECNICA.md seção 5 (problemas backend)
3. PLANO_ACAO_DETALHADO.md Sprint 1-3 (suas tasks)

**Usar:**
- PLANO_ACAO_DETALHADO.md (código de exemplo)
- CODE_REVIEW_GUIDE.md (antes de mergear)

**Acompanhamento:**
- MATRIZ_SUPERVISAO.md (segunda-feira)

---

### 📱 Desenvolvedor Mobile (Flutter)

**Ler:**
1. SUPERVISOR_GUIA_DE_USO.md (overview)
2. Boas praticas.txt (padrões Flutter)
3. PLANO_ACAO_DETALHADO.md Sprint 5

**Usar:**
- CODE_REVIEW_GUIDE.md (checklist mobile)
- Boas praticas.txt (referência contínua)

---

### 🌐 Desenvolvedor Frontend (React)

**Ler:**
1. SUPERVISOR_GUIA_DE_USO.md (overview)
2. DOCUMENTACAO_TECNICA.md (arquitetura web)
3. PLANO_ACAO_DETALHADO.md Sprint 5

**Usar:**
- CODE_REVIEW_GUIDE.md (checklist web)

---

### 🔍 Supervisor/Revisor de Código

**Ler:**
1. SUPERVISOR_GUIA_DE_USO.md
2. CODE_REVIEW_GUIDE.md (completamente!)
3. MATRIZ_SUPERVISAO.md

**Usar continuamente:**
- CODE_REVIEW_GUIDE.md (cada PR)
- MATRIZ_SUPERVISAO.md (toda segunda)

---

## 🚀 Fluxo de Trabalho Padrão

### Segunda-feira (Planejamento)

```
1. Abrir MATRIZ_SUPERVISAO.md
2. Preencher "Checklist Semanal"
3. Revisar status de tasks em PLANO_ACAO_DETALHADO.md
4. Decidir 3-5 tarefas para a semana
5. Criar branches: git checkout -b feature/[task-id]
```

### Terça-Sexta (Desenvolvimento)

```
1. Abrir PLANO_ACAO_DETALHADO.md
2. Pegar task específica (ex: S1.1)
3. Seguir passo a passo com código de exemplo
4. Testar localmente
5. Commit & Push
6. Abrir PR
```

### Antes de Mergear (Code Review)

```
1. Abrir CODE_REVIEW_GUIDE.md
2. Fazer Self-Review com Checklist
3. Corrigir problemas
4. Chamar revisor
5. Resolver comentários
6. Mergear (após ✅)
```

### Segunda-feira Seguinte (Relatório)

```
1. Abrir MATRIZ_SUPERVISAO.md
2. Preencher relatório semanal
3. Atualizar métricas
4. Compartilhar com orientador se necessário
5. Planejar próxima semana
```

---

## 📊 Métricas Rápidas

**Status do Projeto (agora):**
- Segurança: 🔴 CRÍTICA (7 issues)
- Arquitetura: 🟡 Precisa refatoração
- Testes: ❌ Nenhum
- Score: 4/10

**Após Sprint 1:**
- Segurança: 🟢 Implementada
- Score: 5.5/10

**Após Sprint 5:**
- Tudo: 🟢 Production-ready
- Score: 9/10

---

## 🔗 Links Internos Rápidos

**Por Tarefa:**
- Senha: PLANO_ACAO_DETALHADO.md → S1.1
- CORS: PLANO_ACAO_DETALHADO.md → S1.2
- Env vars: PLANO_ACAO_DETALHADO.md → S1.3
- JWT: PLANO_ACAO_DETALHADO.md → S1.4
- DTOs: PLANO_ACAO_DETALHADO.md → A2.1
- Services: PLANO_ACAO_DETALHADO.md → A2.2
- Validation: PLANO_ACAO_DETALHADO.md → A2.3
- Exceptions: PLANO_ACAO_DETALHADO.md → A2.4
- Swagger: PLANO_ACAO_DETALHADO.md → A2.5

**Por Problema:**
- "Build quebrou": MATRIZ_SUPERVISAO.md → Troubleshooting
- "Security issue": MATRIZ_SUPERVISAO.md → Alertas
- "Qual padrão usar": CODE_REVIEW_GUIDE.md → Seção relevante
- "Como começar": SUPERVISOR_GUIA_DE_USO.md → Próximos passos

---

## 🎓 Começando Agora

**Se é a primeira vez:**
1. Leia SUPERVISOR_GUIA_DE_USO.md (5 min)
2. Leia DOCUMENTACAO_TECNICA.md (15 min)
3. Abra PLANO_ACAO_DETALHADO.md e procure S1.1
4. Comece a codar!

**Se é segunda-feira:**
1. Abra MATRIZ_SUPERVISAO.md
2. Preencha checklist semanal
3. Gere relatório
4. Planeje semana

**Se está revisando PR:**
1. Abra CODE_REVIEW_GUIDE.md
2. Siga checklist
3. Use templates de comentários
4. Aprove ou solicite mudanças

---

## 📞 Contatos

| Questão | Responsável |
|---------|-------------|
| **Supervisão geral** | João Vitor |
| **Dúvidas técnicas** | João Vitor + Time |
| **Code reviews** | João Vitor + Peers |
| **Orientação TCC** | Orientador + João |

---

## 📅 Próximas Datas Importantes

- **27/05** (hoje): Documentação criada ✅
- **28/05**: Iniciar Sprint 1
- **03/06**: Relatório semanal #1
- **10/06**: Relatório semanal #2
- **17/06**: Fim Sprint 1
- **24/06**: Fim Sprint 2
- **01/07**: Fim Sprint 3
- **08/07**: Fim Sprint 4
- **15/07**: Fim Sprint 5 → Production ready!

---

**Versão:** 1.0  
**Status:** ✅ Completo  
**Próxima revisão:** 03/06/2026

