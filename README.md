# StudyFlow - Plataforma de Gestão de Estudos e Aprendizado

## 📌 Visão Geral
O **StudyFlow** é um ecossistema de aprendizado projetado para otimizar a retenção de conhecimento e a organização acadêmica. A plataforma integra a gestão de cronogramas (Agenda), o aprendizado ativo via Flashcards e a validação de conhecimento através de Simulados e Questões.

A solução utiliza uma arquitetura **Client-Server** moderna, com um backend robusto em Spring Boot e uma interface mobile responsiva em Flutter.

---

## 🏗️ Arquitetura do Sistema

O projeto está dividido em três camadas principais:

1.  **Backend (API REST):** Desenvolvido em Java com Spring Boot, responsável pela lógica de negócio, persistência e exposição de endpoints.
2.  **Mobile Client (Flutter):** Aplicação multiplataforma que consome a API para fornecer uma experiência de usuário fluida.
3.  **Persistence:** Banco de dados relacional MySQL com mapeamento via JPA/Hibernate.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Linguagem:** Java 21
- **Framework:** Spring Boot 4.0.3
- **ORM:** Spring Data JPA / Hibernate
- **Database Driver:** MySQL Connector/J
- **Build Tool:** Gradle

### Frontend (Mobile)
- **Linguagem:** Dart
- **Framework:** Flutter
- **Gerenciamento de Estado:** StatefulWidget (nativo)
- **Comunicação:** Pacote HTTP para consumo de API REST

### Banco de Dados
- **Motor:** MySQL 8.0+
- **Modelagem:** Diagrama Entidade-Relacionamento (DER) incluído na pasta `/Banco de dados`.

---

## 📂 Estrutura de Diretórios

```text
/pi-joao
├── 📂 DemoAPI/demo           # Código fonte do Backend (Spring Boot)
├── 📂 TESTE CONSUMO API      # Código fonte do Mobile (Flutter)
│   └── 📂 teste_consumo      # Projeto Flutter principal
├── 📂 Banco de dados         # Documentação, SQL e Diagramas do BD
└── 📄 GEMINI.md              # Contexto técnico para agentes de IA
```

---

## 🛠️ Configuração e Execução

### 1. Requisitos Próximos
- JDK 21 ou superior.
- Flutter SDK (versão estável).
- Instância MySQL ativa.

### 2. Configurando o Banco de Dados
O sistema utiliza o banco de dados `projeto_integrador`.
1. Certifique-se de que o MySQL está rodando.
2. O Spring Boot está configurado com `ddl-auto=update`, o que significa que as tabelas serão criadas automaticamente ao iniciar o backend.
3. Caso queira rodar os scripts manuais, utilize os arquivos em `/Banco de dados/*.sql`.

### 3. Executando o Backend
```bash
cd DemoAPI/demo
./gradlew bootRun
```
A API estará disponível em `http://localhost:8080`.

### 4. Executando o Mobile
```bash
cd "TESTE CONSUMO API/teste_consumo"
flutter pub get
flutter run
```

---

## 📡 Documentação da API (Endpoints Principais)

A API segue os padrões RESTful. Abaixo, os principais controladores:

| Recurso | Base Path | Descrição |
| :--- | :--- | :--- |
| **Usuários** | `/apiUsuario` | Cadastro, login e gestão de perfil. |
| **Matérias** | `/apiMateria` | Organização de disciplinas e progresso. |
| **Questões** | `/apiQuestao` | Banco de perguntas e respostas. |
| **Flashcards** | `/apiFlashcard` | Criação de cartões para repetição espaçada. |
| **Agenda** | `/apiCompromisso` | Gestão de datas e compromissos acadêmicos. |

---

## 📝 Convenções de Desenvolvimento

- **Padrão de Resposta:** Todas as respostas da API são em JSON.
- **CORS:** Habilitado para todos os origens durante a fase de desenvolvimento.
- **Conectividade Mobile:** No Android Emulator, utilize o IP `10.0.2.2` para acessar o localhost da máquina hospedeira.

---
**Status do Projeto:** 🛠️ Em desenvolvimento.
