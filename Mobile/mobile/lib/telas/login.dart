import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'auth_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _rememberMe = false;
  bool _obscurePassword = true;

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

              // Título
              const Text(
                'Seja bem vindo',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Efetue seu login',
                style: TextStyle(fontSize: 13, color: Colors.white54),
              ),

              const SizedBox(height: 32),

              // Botão Google
              const GoogleButton(),

              const SizedBox(height: 20),

              // Divisor "ou"
              const OrDivider(),

              const SizedBox(height: 20),

              // Campo email/usuário
              const AuthTextField(
                label: 'email ou usuário',
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 16),

              // Campo senha
              PasswordField(
                label: 'Senha',
                obscure: _obscurePassword,
                onToggle: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),

              const SizedBox(height: 12),

              // Lembrar-me + Esqueceu senha
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Switch(
                        value: _rememberMe,
                        onChanged: (v) => setState(() => _rememberMe = v),
                        activeTrackColor: Colors.white30,
                        inactiveThumbColor: Colors.white38,
                        inactiveTrackColor: Colors.white12,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'Lembrar-me',
                        style: TextStyle(fontSize: 12, color: Colors.white70),
                      ),
                    ],
                  ),
                  const Text(
                    'Esqueceu sua senha?',
                    style: TextStyle(fontSize: 12, color: Colors.white54),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Botão Acessar
              PrimaryButton(
                label: 'Acessar',
                onPressed: () {
                  // 🔧 BACK-END: Apenas navegação, sem lógica
                  context.go('/home');
                },
              ),

              const SizedBox(height: 40),

              // Link cadastro
              GestureDetector(
                onTap: () {
                   context.go('/cadastro');
                },
                child: const Text(
                  'Não tem uma conta?',
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