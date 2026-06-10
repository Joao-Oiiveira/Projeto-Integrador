import 'package:flutter/material.dart';
import 'package:mobile/rotas.dart';
import 'package:mobile/servicos/accessibility_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // 👈 necessário para async no main
  await accessibilityProvider
      .carregarConfiguracoes(); // 👈 carrega configurações salvas
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AccessibilityConsumer(
      builder:
          (context) => MaterialApp.router(
            title: 'Meu App',
            debugShowCheckedModeBanner: false,

            // Tema escuro
            darkTheme: ThemeData(
              brightness: Brightness.dark,
              scaffoldBackgroundColor: const Color(0xFF121212),
              fontFamily:
                  accessibilityProvider.fonteDislexia
                      ? 'OpenDyslexic'
                      : null, // 👈 fonte para dislexia
            ),

            // Tema claro
            theme: ThemeData(
              brightness: Brightness.light,
              scaffoldBackgroundColor: const Color(0xFFF5F5F5),
              fontFamily:
                  accessibilityProvider.fonteDislexia
                      ? 'OpenDyslexic'
                      : null, // 👈 fonte para dislexia
            ),

            // 👈 muda conforme a preferência do usuário
            themeMode:
                accessibilityProvider.temaClaro
                    ? ThemeMode.light
                    : ThemeMode.dark,

            routerConfig: appRouter,
          ),
    );
  }
}
