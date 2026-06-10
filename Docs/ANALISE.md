# Análise Arquitetural e de Segurança - StudyFlow

## 1. Análise de Boas Práticas (Arquitetura e Código)

### 🟢 Pontos Positivos
- **Desacoplamento:** A separação clara entre Backend (API) e Frontend (Mobile) permite evolução independente das plataformas.
- **Stack Moderna:** O uso de Java 21 e Flutter coloca o projeto em conformidade com as tecnologias atuais de mercado.
- **Estrutura de Pacotes:** O backend segue a organização padrão do Spring Boot (`controller`, `model`, `repository`).

### 🔴 Oportunidades de Melhoria
- **Ausência de Camada de Serviço (Service Layer):** Atualmente, a lógica de persistência está diretamente nos Controllers.
    - *Risco:* Dificulta a reutilização de código e a implementação de regras de negócio complexas.
    - *Recomendação:* Introduzir `@Service` entre o Controller e o Repository.
- **Falta de DTOs (Data Transfer Objects):** As entidades do banco de dados são expostas diretamente na API.
    - *Risco:* Mudanças na estrutura da tabela quebram o contrato da API; exposição desnecessária de campos internos.
    - *Recomendação:* Utilizar DTOs para entrada e saída de dados.
- **Gerenciamento de Estado no Flutter:** A lógica de negócio e as chamadas de rede estão misturadas com a UI (`main.dart`).
    - *Risco:* Código de difícil leitura e teste unitário impossível.
    - *Recomendação:* Implementar um padrão de gerência de estado (Provider, Bloc ou Riverpod) e separar o cliente HTTP em uma classe `Repository`.

---

## 2. Segurança (Security Audit)

### ⚠️ Crítico: Proteção de Dados
- **Senhas em Texto Plano:** Não há evidência de hashing (BCrypt) para senhas.
    - *Risco:* Se o banco de dados for comprometido, todas as senhas dos usuários estarão expostas.
    - *Recomendação:* Implementar **Spring Security** e utilizar `BCryptPasswordEncoder`.
- **CORS Permissivo:** `@CrossOrigin(origins = "*")` é usado em todos os controllers.
    - *Risco:* Permite que qualquer site malicioso faça requisições à API.
    - *Recomendação:* Restringir os domínios permitidos em ambiente de produção.

### ⚠️ Médio: Autenticação e Autorização
- **Falta de Autenticação:** Atualmente, os endpoints de criação, deleção e listagem estão abertos.
    - *Recomendação:* Implementar autenticação via **JWT (JSON Web Token)**.
- **Credenciais no Código:** O arquivo `application.properties` contém senhas do banco de dados em texto puro.
    - *Recomendação:* Utilizar variáveis de ambiente para dados sensíveis.

---

## 3. Validação de Dados e Integridade

### Backend (Server-side)
- **Falta de JSR-303 (Bean Validation):** Os campos como email e data de nascimento não possuem validações no modelo (ex: `@Email`, `@NotBlank`, `@Past`).
    - *Risco:* Inserção de dados inconsistentes ou malformados no banco.
    - *Recomendação:* Adicionar a dependência `spring-boot-starter-validation` e anotar os modelos e DTOs.
- **Tratamento de Exceções:** A API não possui um `GlobalExceptionHandler`.
    - *Risco:* Em caso de erro, a API pode retornar stacktraces completos, expondo detalhes da infraestrutura.
    - *Recomendação:* Implementar `@ControllerAdvice` para retornar mensagens de erro padronizadas.

### Frontend (Client-side)
- **Validação Minimalista:** A validação atual apenas verifica se os campos não estão vazios.
    - *Recomendação:* Implementar máscaras para datas, regex para emails e indicadores de força de senha na UI.

---

## 🚀 Plano de Ação Recomendado

1.  **Sprint 1 (Segurança):** Implementar hashing de senha e restringir CORS.
2.  **Sprint 2 (Refatoração):** Criar camada de Service e introduzir DTOs no Backend.
3.  **Sprint 3 (Validação):** Adicionar Bean Validation no Spring e máscaras no Flutter.
4.  **Sprint 4 (Arquitetura Mobile):** Separar lógica de rede da interface de usuário.
