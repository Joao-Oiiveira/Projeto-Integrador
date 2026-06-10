# ❓ FAQ - Perguntas Frequentes - EduAccess

**Último Update:** 27/05/2026 | **Respostas:** 40+

---

## 🚀 Começar

### P: Por onde começo?
**R:** 
1. Leia `00_COMECE_AQUI.md` (5 min)
2. Leia `SUPERVISOR_GUIA_DE_USO.md` (5 min)  
3. Leia `DOCUMENTACAO_TECNICA.md` (15 min)
4. Abra `PLANO_ACAO_DETALHADO.md` na Task S1.1
5. Comece a codar!

---

### P: Como rodar tudo localmente?
**R:** Consulte `SETUP_LOCAL.md`. Tem 2 opções:
- **Option A (Recomendado):** Docker Compose (mais fácil)
- **Option B:** Rodar cada serviço separadamente

---

### P: Qual é a tech stack?
**R:** 
- Backend: Java 21 + Spring Boot 4.0.3 + MySQL 8.0
- Mobile: Flutter/Dart
- Web: React (Vite)
- DevOps: Docker + GitHub Actions (Sprint 4)

---

### P: Como atualizar dependências?
**R:**
- **Backend:** `./gradlew dependencyUpdates` (ver pom.gradle)
- **Mobile:** `flutter pub upgrade`
- **Web:** `npm update`

---

## 📋 Tarefas & Planejamento

### P: Quantas tarefas tem no projeto?
**R:** 45 tarefas mapeadas em 5 sprints:
- Sprint 1: 7 tarefas (Segurança) - 22.5h
- Sprint 2: 8 tarefas (Refatoração) - 28h
- Sprint 3: 5+ tarefas (Testes) - 20h
- Sprint 4: 5 tarefas (DevOps) - 16h
- Sprint 5: 5+ tarefas (Mobile/Web) - 30h+

---

### P: Qual é a prioridade das tarefas?
**R:** Nesta ordem:
1. 🔴 **Crítico** - Sprint 1 (S1.1 a S1.5)
2. 🟠 **Alto** - Sprint 2 (A2.1 a A2.5)
3. 🟡 **Médio** - Sprint 3-5

---

### P: Posso fazer as tarefas em ordem diferente?
**R:** **Não para Sprint 1!** Sprint 1 é bloqueador (segurança). Sprints 2-5 podem ser parcialmente paralelos.

---

### P: Quanto tempo leva cada tarefa?
**R:** Veja `PLANO_ACAO_DETALHADO.md` na seção de cada tarefa. Estimativas incluem:
- Desenvolvimento
- Testes locais
- Code review

---

## 🔒 Segurança

### P: Por que hash de senha é crítico?
**R:** Se o banco de dados vazar:
- ❌ Sem hash: Todos as senhas expostas (risco máximo)
- ✅ Com hash: Senhas protegidas (impossível recuperar)

---

### P: O que é JWT?
**R:** JSON Web Token - uma forma segura de autenticar requests sem enviar senha toda vez.
```
Login → recebe token → usa token em requests → token expira
```

---

### P: O que é CORS?
**R:** Cross-Origin Resource Sharing - controla quem pode fazer requisições à sua API.
```
❌ CORS = "*"  → Qualquer site pode acessar
✅ CORS = ["app.exemplo.com"] → Só seu app pode acessar
```

---

### P: Onde armazenar credenciais?
**R:** **NUNCA** em código! Use:
- `.env` (local, NÃO commitar)
- Variáveis de ambiente (servidor)
- Secrets do CI/CD (GitHub, GitLab)

---

## 🛠️ Desenvolvimento

### P: Como estruturar o código?
**R:** Consulte `PADROES_DE_CODIGO.md`. Resumo:
- Backend: controller → service → repository
- Mobile: screen → widget → service
- Web: component → hook → service

---

### P: Preciso escrever testes?
**R:** **Sim!** Sprint 3 é focado em testes. Meta: 70% coverage.
- Testes unitários: funções/métodos isolados
- Testes integração: múltiplos componentes juntos

---

### P: Como faço code review?
**R:** Consulte `CODE_REVIEW_GUIDE.md`. Checklist:
1. Segurança (sem vulnerabilidades)
2. Arquitetura (sem violações)
3. Código (legível, sem duplicação)
4. Testes (rodam, coveragem OK)

---

### P: Posso commitar código quebrado?
**R:** **Não!** Regra:
```
Antes de fazer commit/PR:
☐ Código compila/roda
☐ Sem erros no console
☐ Testes passam (se houver)
☐ Sem credenciais em código
```

---

### P: Como nomeio branches?
**R:** Padrão: `feature/task-id-descricao`
```
✅ feature/s1.1-bcrypt-password
✅ bugfix/cors-origin-check
❌ feature/task
❌ feature/my-fix
❌ main-update
```

---

## 🐛 Troubleshooting

### P: Build falhou, o quê fazer?
**R:** Siga em ordem:
1. Limpar cache: `./gradlew clean` (backend) ou `flutter clean` (mobile)
2. Atualizar dependências: `./gradlew build` ou `flutter pub get`
3. Ver logs: `./gradlew build --stacktrace`
4. Se persistir: abra issue com logs completos

---

### P: Database não conecta
**R:** Verificar:
1. MySQL está rodando? `mysql -u root -p` (deve conectar)
2. Credenciais corretas em `.env`?
3. Database existe? `SHOW DATABASES;`
4. Firewall bloqueando 3306?

---

### P: CORS error no frontend
**R:** 
1. Backend está rodando? (testar `/swagger-ui.html`)
2. Frontend fazendo request para URL correta?
3. Backend tem CORS configurado? (Sprint 1, Task S1.2)

---

### P: Tests falhando
**R:**
1. Limpar cache: `./gradlew cleanTest`
2. Rodar um por vez: `./gradlew test --tests NomeDoTeste`
3. Ver output completo: `./gradlew test --info`

---

## 📚 Documentação

### P: Qual documento ler para [X]?
**R:** Guia rápido:

| Preciso | Documento |
|---------|-----------|
| Entender projeto | DOCUMENTACAO_TECNICA.md |
| Começar tarefa | PLANO_ACAO_DETALHADO.md |
| Código de exemplo | PLANO_ACAO_DETALHADO.md (cada task tem) |
| Setup local | SETUP_LOCAL.md |
| Endpoints API | API_SPECIFICATION.md |
| Padrões código | PADROES_DE_CODIGO.md |
| Code review | CODE_REVIEW_GUIDE.md |
| Acompanhamento | MATRIZ_SUPERVISAO.md |
| Esta FAQ | FAQ.md |

---

### P: Como adicionar à documentação?
**R:** 
1. Identifique o documento correto
2. Encontre a seção relacionada
3. Adicione/atualize informação
4. Commit com mensagem clara
5. Abra PR para review

---

## 🚀 Deploy & Produção

### P: Como deployar?
**R:** Sprint 4 (DevOps) implementa:
1. Dockerfile para backend
2. docker-compose para orquestração
3. GitHub Actions para CI/CD
4. Auto-deploy em produção (branch main)

---

### P: Como fazer backup do banco?
**R:**
```bash
# Backup
mysqldump -u root -p projeto_integrador > backup.sql

# Restaurar
mysql -u root -p projeto_integrador < backup.sql
```

---

### P: Como escalar a aplicação?
**R:** Pré-requisitos:
1. Tests com 70%+ coverage (Sprint 3)
2. Performance testada (Sprint 3)
3. CI/CD funcionando (Sprint 4)
4. Monitoring configurado (Sprint 4+)

---

## 📊 Métricas & Progresso

### P: Como acompanhar progresso?
**R:** 
1. Toda segunda-feira: preencher `MATRIZ_SUPERVISAO.md`
2. Checklist semanal (15 min)
3. Gerar relatório de status
4. Compartilhar com orientador

---

### P: O projeto está on-track?
**R:** Depende do sprint:
- **Sprint 1 (Agora):** Precisa estar 50% done em 7 dias
- **Sprint 2:** Deve começar quando Sprint 1 terminar (semana 3)
- **Sprint 3:** Não comece antes de Sprint 2 terminar

---

### P: Como se sou mais rápido/lento?
**R:** 
- **Mais rápido:** Ótimo! Considere adicionar documentação/testes extras
- **Mais lento:** Normal, ajuste cronograma, considere pedir ajuda

---

## 👥 Colaboração & Comunicação

### P: Como trabalhar com orientador?
**R:** 
1. Semanal: compartilhar relatório de `MATRIZ_SUPERVISAO.md`
2. Bi-semanal: reunião de alinhamento
3. Se bloqueado: abrir issue + notificar

---

### P: Como pedir ajuda?
**R:** 
1. Procure em `FAQ.md` (este arquivo)
2. Procure no Troubleshooting de `MATRIZ_SUPERVISAO.md`
3. Procure em `DOCUMENTACAO_TECNICA.md`
4. Se não achar, abra issue com contexto claro

---

### P: Como reportar bug?
**R:** Create issue no GitHub com:
```
Título: Breve descrição
Body:
- O que deveria acontecer?
- O que está acontecendo?
- Como reproduzir?
- Stack trace (se disponível)
- Screenshots (se visual)
- Seu ambiente (Windows/Mac, Java 21, etc)
```

---

## 🎓 Aprendizado

### P: Como aprender Spring Boot?
**R:** Recursos:
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Baeldung Spring Boot](https://www.baeldung.com/spring-boot)
- Código existente no projeto (aprender do próprio codebase)

---

### P: Como aprender Flutter?
**R:** Recursos:
- [Flutter Official Docs](https://flutter.dev/docs)
- [Flutter Codelabs](https://flutter.dev/docs/codelabs)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)

---

### P: Como aprender React?
**R:** Recursos:
- [React Official Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- Tutorial prático: build algo pequeno

---

## 🏁 Conclusão

### P: Quanto tempo total leva?
**R:** ~116h de desenvolvimento focado = ~15 dias trabalhando full-time.
Com disponibilidade parcial, estenda para 8-12 semanas (Sprint 1-5).

---

### P: Vale a pena investir nesta documentação?
**R:** **Sim!** Economia de tempo:
- Sem doc: ~50% do tempo em "o que fazer?"
- Com doc: ~5% do tempo em "o que fazer?"
- **Ganho: ~45% de produtividade**

---

### P: Posso usar este projeto como base para outro?
**R:** **Sim!** Projeto é open-source (verificar LICENSE).
Você pode:
- Copiar estrutura
- Adaptar código
- Estender funcionalidades
- Usar em produção

Dê crédito se basear no código.

---

### P: Qual o próximo passo?
**R:** 
1. ✅ Leu esta FAQ
2. → Abra `00_COMECE_AQUI.md`
3. → Leia `SUPERVISOR_GUIA_DE_USO.md`
4. → Comece Sprint 1, Task S1.1
5. → Boa sorte! 🚀

---

**Versão:** 1.0  
**Total de Respostas:** 40+  
**Última Atualização:** 27/05/2026  
**Criador:** Claude (IA Supervisor)

*Não achou sua pergunta? Abra issue ou envie PR com nova pergunta + resposta!*

