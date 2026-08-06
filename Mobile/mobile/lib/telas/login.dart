import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/servicos/auth_service.dart';
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
  bool _isLoading = false;

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _senhaController = TextEditingController();
  final AuthService _authService = AuthService();

  @override
  void dispose() {
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  void _fazerLogin() async {
    final email = _emailController.text.trim();
    final senha = _senhaController.text.trim();

    if (email.isEmpty || senha.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, preencha o e-mail e a senha.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Chama a API Python para validar o login no MySQL
      final resultado = await _authService.loginComEmailESenha(email, senha);

      if (!mounted) return;

      final nomeUsuario = resultado['usuario']?['nome'] ?? 'Usuário';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Bem-vindo(a), $nomeUsuario!'),
          backgroundColor: Colors.green,
        ),
      );

      // Apenas navega para o menu se a API Python confirmar que a conta EXISTE e a senha está correta
      context.go('/menu');
    } catch (e) {
      if (!mounted) return;

      // Exibe mensagem de erro se a conta NÃO EXISTIR ou a senha estiver errada
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
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
              AuthTextField(
                controller: _emailController,
                label: 'E-mail',
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 16),

              // Campo senha
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
              _isLoading
                  ? const CircularProgressIndicator(color: AppColors.destaque)
                  : PrimaryButton(
                      label: 'Acessar',
                      onPressed: _fazerLogin,
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
