# 📋 Guia de Code Review - EduAccess

**Objetivo:** Garantir qualidade, segurança e consistência do código  
**Frequência:** A cada Pull Request  
**Versão:** 1.0

---

## ✅ Checklist de Code Review

### 🔒 Segurança (OBRIGATÓRIO)

- [ ] Nenhuma senha/token em texto plano no código
- [ ] Nenhuma credencial hardcoded (db, api keys)
- [ ] Inputs do usuário são validados
- [ ] Saídas são escapadas (XSS prevention)
- [ ] SQL Injection prevenido (usando JPA/Parameterized queries)
- [ ] Sem `@CrossOrigin(origins = "*")`
- [ ] Senhas hasheadas com BCrypt
- [ ] Sem console.log de dados sensíveis
- [ ] Sem TODO ou FIXME relacionados a segurança

### 🏗️ Arquitetura (BACKEND)

- [ ] Controllers não têm lógica de negócio (use Service)
- [ ] Services têm `@Transactional` quando apropriado
- [ ] Repositories usam Spring Data JPA
- [ ] DTOs são usados para entrada/saída
- [ ] Entidades JPA não são retornadas diretamente
- [ ] Camada de Service reutiliza métodos (DRY)
- [ ] Sem duplicação de código
- [ ] Exceções mapeadas no GlobalExceptionHandler

### 🎨 Arquitetura (MOBILE - FLUTTER)

- [ ] Telas em `lib/telas/`
- [ ] Models em `lib/models/` com `fromJson`/`toJson`
- [ ] Serviços de API em `lib/servicos/`
- [ ] Temas em `lib/tema/`
- [ ] Cores usam `AppColors.*` (centralizado)
- [ ] TextStyles usam `AppTextStyles.*` (centralizado)
- [ ] Controllers dispostos no `dispose()`
- [ ] Sem lógica HTTP dentro da tela
- [ ] Tratamento de erro implementado
- [ ] Loading state implementado

### 🌐 Arquitetura (WEB - REACT)

- [ ] Componentes em `src/components/`
- [ ] Páginas em `src/pages/`
- [ ] API calls em `src/services/`
- [ ] State management centralizado
- [ ] Sem lógica de API dentro de componentes
- [ ] Props properly typed (TypeScript)
- [ ] Sem console.log em produção
- [ ] Tratamento de erro implementado

### 📝 Código

- [ ] Nomes de variáveis são descritivos
- [ ] Funções têm responsabilidade única
- [ ] Métodos não muito longos (máx 30 linhas)
- [ ] Sem commented code (delete, não comment)
- [ ] Sem `console.log`, `print`, `debug` statements
- [ ] Sem blank lines excessivas
- [ ] Indentação consistente (2 ou 4 espaços)
- [ ] Nomes em inglês (ou português consistente)

### 🧪 Testes

- [ ] Testes foram adicionados/atualizados
- [ ] Testes cobrem happy path + edge cases
- [ ] Tests nomeados descritivamente
- [ ] Sem testes skipped (`@Disabled`, `.skip()`)
- [ ] Coverage não diminuiu

### 📚 Documentação

- [ ] README atualizado se mudou setup
- [ ] Comentários adicionados APENAS se WHY não óbvio
- [ ] JavaDoc em métodos públicos (backend)
- [ ] PR description clara e detalhada
- [ ] DOCUMENTACAO_TECNICA.md atualizado

### 🎯 Performance

- [ ] Sem N+1 queries (use `@EntityGraph` no JPA)
- [ ] Sem loops desnecessários
- [ ] Sem chamadas de API em loops
- [ ] Pagination implementada se necessário (listas grandes)
- [ ] Cache considerado para dados estáticos

### ♿ Acessibilidade

- [ ] Cores contrastadas o suficiente
- [ ] Fontes legíveis
- [ ] Sem dependência única de cor
- [ ] Botões com tamanho mínimo (48px mobile)
- [ ] Text-to-speech compatível (mobile)
- [ ] Labels em inputs/formulários
- [ ] ARIA labels onde apropriado (web)

---

## 🔴 Bloqueadores (REJEITAR PR)

Se encontrar qualquer um desses, solicitar correção:

- ❌ Código com vulnerabilidade de segurança
- ❌ Senhas/credenciais em plaintext
- ❌ Testes falhando
- ❌ Build quebrado
- ❌ Sem tratamento de erro
- ❌ Lógica de negócio nos controllers (backend)
- ❌ Entidades expostas na API (sem DTO)
- ❌ CORS permissivo
- ❌ SQL Injection possível
- ❌ Duplicação flagrante de código (>20 linhas iguais)

---

## 🟡 Sugestões (NÃO BLOQUEADOR)

Comentários úteis mas não críticos:

- "Considere extrair essa lógica para um método privado"
- "Este teste poderia cobrir o caso de erro também"
- "Variável `x` poderia ter nome mais descritivo"
- "Há oportunidade de usar um padrão aqui"

---

## 📝 Template de Comentário

### Para Problemas Críticos

```
🔴 CRÍTICO: [Título]

**Problema:** [Explique o quê está errado]
**Por quê:** [Explique o impacto/risco]
**Solução:** [Código ou instruções]

[Código de exemplo se aplicável]

Precisa ser corrigido antes de mergear.
```

### Para Sugestões

```
💡 Sugestão: [Título]

Considere [o quê fazer]. Isso [benefício].

Não é bloqueador, mas melhoraria [aspecto].
```

### Para Perguntas

```
❓ Dúvida: [Pergunta]

[Contexto adicional se necessário]

Só confirmando que [x] é a intenção?
```

---

## 🚀 Antes de Aprovar

**Verificar:**
- [ ] Todos os comentários respondidos
- [ ] Problemas críticos corrigidos
- [ ] Testes passando (CI green)
- [ ] Código segue padrões do projeto
- [ ] Documentação atualizada

**Clicar em "Approve"** ✅

---

## 📊 Métricas a Acompanhar

Por PR:
- Número de commits (< 20 é bom)
- Linhas alteradas (< 400 é bom)
- Tempo de review (< 24h é bom)
- Número de revisões (1-2 é padrão)

---

**Responsável:** Todos os desenvolvedores  
**Revisor por padrão:** João Vitor Barbosa de Oliveira

