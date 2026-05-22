import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'auth_widgets.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  bool _obscurePassword = true;
  bool _acceptTerms = false;

  // 🔧 BACK-END: Controllers para capturar o que o usuário digita
  final TextEditingController _nomeController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _senhaController = TextEditingController();

  @override
  void dispose() {
    // 🔧 BACK-END: Sempre libere os controllers quando a tela for destruída
    _nomeController.dispose();
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 24),

              // ── Título ──────────────────────────────
              const Text(
                'Crie sua conta',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Insira seu nome completo, email, senha para\ncriar sua conta e começar',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white54,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 32),

              // ── Botão Google ────────────────────────
              // 🔧 BACK-END: Ao pressionar, chamar autenticação OAuth com Google
              // Ex: AuthService.signInWithGoogle()
              const GoogleButton(),

              const SizedBox(height: 20),

              // ── Divisor "ou" ────────────────────────
              const OrDivider(),

              const SizedBox(height: 20),

              // ── Campo Nome completo ──────────────────
              // 🔧 BACK-END: _nomeController.text terá o nome digitado
              TextField(
                controller: _nomeController,
                keyboardType: TextInputType.name,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                cursorColor: Colors.white,
                decoration: InputDecoration(
                  labelText: 'Nome completo',
                  labelStyle:
                      const TextStyle(color: Colors.white38, fontSize: 13),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.white24),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.white60),
                  ),
                  filled: true,
                  fillColor: const Color(0xFF1A1A1A),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 14),
                ),
              ),

              const SizedBox(height: 16),

              // ── Campo E-mail ─────────────────────────
              // 🔧 BACK-END: _emailController.text terá o email digitado
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                cursorColor: Colors.white,
                decoration: InputDecoration(
                  labelText: 'E-mail',
                  labelStyle:
                      const TextStyle(color: Colors.white38, fontSize: 13),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.white24),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.white60),
                  ),
                  filled: true,
                  fillColor: const Color(0xFF1A1A1A),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 14),
                ),
              ),

              const SizedBox(height: 16),

              // ── Campo Senha ──────────────────────────
              // 🔧 BACK-END: _senhaController.text terá a senha digitada
              // Lembre de usar hash (ex: bcrypt) antes de enviar para a API
              TextField(
                controller: _senhaController,
                obscureText: _obscurePassword,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                cursorColor: Colors.white,
                decoration: InputDecoration(
                  labelText: 'Senha',
                  labelStyle:
                      const TextStyle(color: Colors.white38, fontSize: 13),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.white24),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Colors.white60),
                  ),
                  filled: true,
                  fillColor: const Color(0xFF1A1A1A),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 14),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: Colors.white38,
                      size: 20,
                    ),
                    onPressed: () => setState(
                        () => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // ── Termos de uso ────────────────────────
              // 🔧 BACK-END: _acceptTerms deve ser true para permitir o cadastro
              // Registrar a data de aceite dos termos no banco de dados
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Switch(
                    value: _acceptTerms,
                    onChanged: (v) => setState(() => _acceptTerms = v),
                    activeColor: Colors.white,
                    activeTrackColor: Colors.white30,
                    inactiveThumbColor: Colors.white38,
                    inactiveTrackColor: Colors.white12,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RichText(
                      text: const TextSpan(
                        style:
                            TextStyle(fontSize: 11, color: Colors.white54),
                        children: [
                          TextSpan(text: 'Concordo em aceitar os '),
                          TextSpan(
                            text: 'termos',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                          TextSpan(text: ' de '),
                          TextSpan(
                            text: 'política e privacidade',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // ── Botão Acessar ────────────────────────
              PrimaryButton(
                label: 'Acessar',
                onPressed: () {
                  // 🔧 BACK-END: Validar campos e chamar a API de cadastro
                  // 1. Verificar se todos os campos estão preenchidos
                  // 2. Verificar se _acceptTerms == true
                  // 3. Validar formato do email
                  // 4. Verificar força da senha
                  // 5. Chamar: AuthService.register(
                  //      nome: _nomeController.text,
                  //      email: _emailController.text,
                  //      senha: _senhaController.text,
                  //    )
                  // 6. Se sucesso → redirecionar para formulário de perfil educacional
                  //    context.go('/perfil-educacional')
                },
              ),

              const SizedBox(height: 40),

              // ── Link para Login ──────────────────────
              GestureDetector(
                onTap: () {
                  context.go('/login');
                  // 🔧 BACK-END: Apenas navegação, sem lógica
                  // context.go('/login');
                },
                child: const Text(
                  'Tem uma conta? Entre aqui',
                  style: TextStyle(fontSize: 13, color: Colors.white38),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}