import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

// ─────────────────────────────────────────────
// Widgets reutilizáveis compartilhados entre
// LoginScreen e SignUpScreen
// ─────────────────────────────────────────────

class GoogleButton extends StatelessWidget {
  const GoogleButton({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: OutlinedButton(
        onPressed: () {},
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: AppColors.borderMedium(context)),
          backgroundColor: AppColors.cardBackground(context),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const FaIcon(FontAwesomeIcons.google, color: Color(0xFFEA4335), size: 20),
            const SizedBox(width: 10),
            Text(
              'Google',
              style: AppTextStyles.subtitulo(
                context,
                color: AppColors.textPrimary(context),
                size: 15.0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OrDivider extends StatelessWidget {
  const OrDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Divider(color: AppColors.border(context), thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'ou',
            style: AppTextStyles.legenda(context, color: AppColors.textHint(context)),
          ),
        ),
        Expanded(child: Divider(color: AppColors.border(context), thickness: 1)),
      ],
    );
  }
}

class AuthTextField extends StatelessWidget {
  final String label;
  final TextInputType keyboardType;
  final TextEditingController? controller;

  const AuthTextField({
    super.key,
    required this.label,
    this.keyboardType = TextInputType.text,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: AppTextStyles.corpo(context, color: AppColors.textPrimary(context)),
      cursorColor: AppColors.textPrimary(context),
      decoration: InputDecoration(
        labelText: label,
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
      ),
    );
  }
}

class PasswordField extends StatelessWidget {
  final String label;
  final bool obscure;
  final VoidCallback onToggle;
  final TextEditingController? controller;

  const PasswordField({
    super.key,
    required this.label,
    required this.obscure,
    required this.onToggle,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      style: AppTextStyles.corpo(context, color: AppColors.textPrimary(context)),
      cursorColor: AppColors.textPrimary(context),
      decoration: InputDecoration(
        labelText: label,
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
            obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
            color: AppColors.textHint(context),
            size: 20,
          ),
          onPressed: onToggle,
        ),
      ),
    );
  }
}

class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.textPrimary(context),
          foregroundColor: AppColors.background(context),
          side: BorderSide(color: AppColors.border(context)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          elevation: 0,
        ),
        child: Text(
          label,
          style: AppTextStyles.botao(context, color: AppColors.background(context)),
        ),
      ),
    );
  }
}
