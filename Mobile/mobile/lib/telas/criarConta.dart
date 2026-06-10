import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';
import 'auth_widgets.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  bool _obscurePassword = true;
  bool _acceptTerms = false;

  // Controllers para capturar o que o usuário digita
  final TextEditingController _nomeController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _senhaController = TextEditingController();

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

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
                'Crie sua conta',
                style: AppTextStyles.titulo(context, size: 28.0),
              ),
              const SizedBox(height: 8),
              Text(
                'Insira seu nome completo, email, senha para\ncriar sua conta e começar',
                textAlign: TextAlign.center,
                style: AppTextStyles.corpo(
                  context,
                  size: 13.0,
                  color: AppColors.textSecondary(context),
                ),
              ),

              const SizedBox(height: 32),

              // Botão Google
              const GoogleButton(),

              const SizedBox(height: 20),

              // Divisor "ou"
              const OrDivider(),

              const SizedBox(height: 20),

              // Campo Nome completo
              AuthTextField(
                controller: _nomeController,
                label: 'Nome completo',
                keyboardType: TextInputType.name,
              ),

              const SizedBox(height: 16),

              // Campo E-mail
              AuthTextField(
                controller: _emailController,
                label: 'E-mail',
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 16),

              // Campo Senha
              TextField(
                controller: _senhaController,
                obscureText: _obscurePassword,
                style: AppTextStyles.corpo(context, color: AppColors.textPrimary(context)),
                cursorColor: AppColors.textPrimary(context),
                decoration: InputDecoration(
                  labelText: 'Senha',
                  labelStyle: AppTextStyles.legenda(context, color: AppColors.textHint(context), size: 13.0),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.borderMedium(context)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: AppColors.destaque),
                  ),
                  filled: true,
                  fillColor: AppColors.cardSecondary(context),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 14,
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.textHint(context),
                      size: 20,
                    ),
                    onPressed:
                        () => setState(
                          () => _obscurePassword = !_obscurePassword,
                        ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Termos de uso
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Switch(
                    value: _acceptTerms,
                    onChanged: (v) => setState(() => _acceptTerms = v),
                    activeColor: AppColors.destaque,
                    activeTrackColor: AppColors.destaque.withOpacity(0.3),
                    inactiveThumbColor: AppColors.textHint(context),
                    inactiveTrackColor: AppColors.border(context),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context), size: 11.0),
                        children: [
                          const TextSpan(text: 'Concordo em aceitar os '),
                          TextSpan(
                            text: 'termos',
                            style: AppTextStyles.legenda(
                              context,
                              color: AppColors.textPrimary(context),
                              size: 11.0,
                            ).copyWith(
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                          const TextSpan(text: ' de '),
                          TextSpan(
                            text: 'política e privacidade',
                            style: AppTextStyles.legenda(
                              context,
                              color: AppColors.textPrimary(context),
                              size: 11.0,
                            ).copyWith(
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

              // Botão Cadastrar (Acessar)
              PrimaryButton(
                label: 'Acessar',
                onPressed: () {
                  // Redireciona para o formulário de perfil educacional pós-cadastro
                  context.go('/perfil-educacional');
                },
              ),

              const SizedBox(height: 40),

              // Link para Login
              GestureDetector(
                onTap: () {
                  context.go('/login');
                },
                child: Text(
                  'Tem uma conta? Entre aqui',
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
