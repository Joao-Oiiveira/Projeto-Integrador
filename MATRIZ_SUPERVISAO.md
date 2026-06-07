# 🎯 Matriz de Supervisão - EduAccess

**Propósito:** Acompanhamento semanal/mensal da saúde do projeto  
**Última Atualização:** 27/05/2026  
**Próxima Revisão:** 03/06/2026

---

## 📊 Dashboard de Status

```
┌─────────────────────────────────────────────────────┐
│ SAÚDE DO PROJETO: 🟡 MÉDIO                          │
├─────────────────────────────────────────────────────┤
│ Segurança:           🔴 CRÍTICA (7 issues)          │
│ Arquitetura:         🟡 PRECISA REFATORAÇÃO        │
│ Qualidade:           🟡 SEM TESTES FORMAIS         │
│ Documentação:        🟢 BOA (após update)           │
│ Performance:         🟢 OK (MVP)                     │
│ Acessibilidade:      🟡 PARCIAL (temas exist)      │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Checklist Semanal

**Executar toda segunda-feira:**

### Build & Deployment

- [ ] Backend compila sem warnings
- [ ] Mobile compila (iOS + Android)
- [ ] Frontend web bundlea
- [ ] Nenhum erro de runtime nos logs
- [ ] Banco de dados acessível
- [ ] APIs respondendo em tempo < 2s

### Code Quality

- [ ] Sem TODO/FIXME críticos abertos
- [ ] Nenhuma senha em logs
- [ ] Nenhuma branch stale (> 2 semanas)
- [ ] Coverage não diminuiu (quando testes existirem)

### Security

- [ ] Nenhuma vulnerabilidade CVE conhecida nas dependências
- [ ] Senhas ainda em plaintext? (até Sprint 1 completar)
- [ ] CORS ainda permissivo? (até Sprint 1 completar)

### Issues & PRs

- [ ] PRs aguardando review: ___
- [ ] Issues bloqueadas: ___
- [ ] PRs mescladas esta semana: ___
- [ ] Bugs reportados: ___

---

## 📅 Checklist Mensal

**Executar no primeiro dia do mês:**

### Arquitetura

- [ ] Diagrama da arquitetura ainda válido?
- [ ] Camadas bem separadas?
- [ ] Services reutilizáveis?
- [ ] Sem tight coupling?

### Segurança

- [ ] Audit de segurança agendado?
- [ ] Dependências atualizadas?
- [ ] Nenhuma dependência com vulnerabilidades críticas?
- [ ] Credenciais em repositório? (grep por "password", "secret", "token")

### Performance

- [ ] Query mais lenta: ___ ms
- [ ] Endpoint mais lento: ___
- [ ] Memory leak detectado? Não/Sim → Investigar
- [ ] Cache implementado? (se necessário)

### Team

- [ ] Code reviews happening? (média por PR: __)
- [ ] Documentação atualizada?
- [ ] Conhecimento distribuído ou centralizado em 1 pessoa?
- [ ] Treinamento necessário em: ___

### Roadmap

- [ ] Sprints no prazo?
- [ ] Prioridades ainda fazem sentido?
- [ ] Novos riscos identificados?
- [ ] Deadlines para TCC em risco?

---

## 🚨 Alertas Automáticos

Se algum desses ocorrer, gerar alerta IMEDIATO:

| Alerta | Ação |
|--------|------|
| Segurança crítica descoberta | Pausar merges, investigar, corrigir ASAP |
| Build quebrado > 2 horas | Revert ou corrigir imediatamente |
| Database down | Restaurar do backup, investigar causa |
| Coverage cai > 5% | Revisar PRs, solicitar testes |
| 5+ PRs aguardando review | Dedicar tempo para reviews |
| Issue crítica não respondida > 24h | Atribuir a alguém |

---

## 📈 Métricas Chave

### Por Sprint

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Tarefas completadas | 100% | 0% | 🔴 |
| Issues resolvidas | > 80% | - | - |
| Code coverage | 70% | - | 🔴 |
| Build pass rate | 100% | - | - |
| Security issues | 0 críticas | 7 | 🔴 |

### Trend (últimos 3 meses)

```
Commits por semana:     ▁▂▃▄▅ (aumentando ✅)
PRs por semana:         ▂▂▂▃▃ (estável ✅)
Issues abertos:         ▅▅▄▃▂ (diminuindo ✅)
Code coverage:          ▁▁▁▁▁ (sem testes ainda 🔴)
```

---

## 🎯 OKRs do Projeto

### Trimestre 1 (Abr-Jun 2026)

**Objetivo 1: Codebase Seguro**
- KR1.1: 0 vulnerabilidades críticas de segurança
- KR1.2: Senhas com hash BCrypt
- KR1.3: Autenticação JWT implementada

**Objetivo 2: Arquitetura Escalável**
- KR2.1: 100% endpoints com DTOs e Services
- KR2.2: Validação em 100% dos inputs
- KR2.3: Tratamento de erro globalizado

**Objetivo 3: Qualidade de Código**
- KR3.1: Coverage > 70%
- KR3.2: Zero testes falhando
- KR3.3: Zero technical debt crítico

---

## 📝 Relatório de Status

### Formato (Usar toda segunda-feira)

```markdown
## 📊 Status Report - Semana de [DATA]

**Saúde Geral:** 🟡 MÉDIO

### ✅ Completado Esta Semana
- [ ] Item 1
- [ ] Item 2

### 🚧 Em Progresso
- [ ] Task de Segurança (60%)
- [ ] Refatoração Service (40%)

### 🔴 Bloqueadores
- [ ] Issue X: [descrição]
- [ ] Dependency issue em Y

### 📈 Métricas
- PRs: 3 abertas, 2 mescladas
- Issues: 5 abertas, 2 fechadas
- Coverage: 0% (sem testes)

### 👥 Próximos Passos
1. Finalizar Sprint 1 até [DATA]
2. Code review em [PR #X]
3. Investigar [ISSUE]

### 💭 Notas
- Considerar aumentar time em [ÁREA]
- [OBSERVAÇÃO IMPORTANTE]
```

---

## 🔧 Troubleshooting

### "Build falhou, o quê fazer?"

1. Verificar logs: `./gradlew build --stacktrace`
2. Limpar cache: `./gradlew clean`
3. Se problema em mobile: `flutter clean && flutter pub get`
4. Se database: verificar conexão, rollback último script
5. Se dependência: verificar maven central/pub

### "Performance ruim, o quê investigar?"

1. Logs de query (ativar `spring.jpa.show-sql=true`)
2. Profile com DevTools
3. Verificar N+1 queries (usar `@EntityGraph`)
4. Verificar tamanho das respostas
5. Implementar pagination se lista grande

### "Security issue descoberto, processo?"

1. 🛑 Pausar merges
2. 📋 Criar issue privada
3. 🔍 Investigar scope (quanto código afetado?)
4. 🛠️ Implementar fix em branch isolada
5. ✅ Code review intenso
6. 📢 Comunicar ao time
7. 🚀 Deploy rápido
8. 📝 Post-mortem após resolvido

---

## 📞 Contatos de Escalação

| Problema | Contato | Tempo de Resposta |
|----------|---------|-------------------|
| Security Issue | João (via GitHub Issues privadas) | < 2h |
| Build quebrado | João | < 30min |
| Architecture Question | Team Discussion | < 24h |
| Deadline Risk | João + Orientador TCC | < 24h |

---

## 📚 Documentos Relacionados

- `DOCUMENTACAO_TECNICA.md` - Detalhes técnicos
- `PLANO_ACAO_DETALHADO.md` - Tasks específicas
- `CODE_REVIEW_GUIDE.md` - Padrões de review
- `ANALISE.md` - Audit de segurança
- `Boas praticas.txt` - Convenções Flutter

---

**Supervisor Responsável:** Claude (IA Supervisor)  
**Frequência de Revisão:** Semanal (segundas-feiras) + Mensal (1º dia)  
**Eskalação:** João Vitor Barbosa de Oliveira

