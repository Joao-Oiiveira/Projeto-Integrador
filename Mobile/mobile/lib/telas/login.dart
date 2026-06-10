import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';
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
      backgroundColor: AppColors.background(context),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 24),

              // Título
              Text(
                'Seja bem vindo',
                style: AppTextStyles.titulo(context, size: 26.0),
              ),
              const SizedBox(height: 6),
              Text(
                'Efetue seu login',
                style: AppTextStyles.corpo(context, size: 13.0, color: AppColors.textSecondary(context)),
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
                onToggle:
                    () => setState(() => _obscurePassword = !_obscurePassword),
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
                        activeColor: AppColors.destaque,
                        activeTrackColor: AppColors.destaque.withOpacity(0.3),
                        inactiveThumbColor: AppColors.textHint(context),
                        inactiveTrackColor: AppColors.border(context),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Lembrar-me',
                        style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                      ),
                    ],
                  ),
                  Text(
                    'Esqueceu sua senha?',
                    style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Botão Acessar
              PrimaryButton(
                label: 'Acessar',
                onPressed: () {
                  // Navegação para a Home/Menu
                  context.go('/menu');
                },
              ),

              const SizedBox(height: 40),

              // Link cadastro
              GestureDetector(
                onTap: () {
                  context.go('/cadastro');
                },
                child: Text(
                  'Não tem uma conta?',
                  style: AppTextStyles.corpo(context, size: 13.0, color: AppColors.textHint(context)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
