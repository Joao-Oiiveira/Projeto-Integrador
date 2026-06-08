import 'package:go_router/go_router.dart';
import 'package:mobile/telas/calendario.dart';
import 'package:mobile/telas/calendarioMenu.dart';
import 'package:mobile/telas/criarConta.dart';
import 'package:mobile/telas/menu.dart';
import 'package:mobile/telas/materiaDetalhe.dart';
import 'package:mobile/telas/accessibility_settings.dart';
import 'telas/login.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login', builder: (context, state) => const LoginScreen()
    ),
    
    GoRoute(
      path: '/cadastro',
      builder: (context, state) => const SignUpScreen(),
    ),

    GoRoute(
      path: '/menu', builder: (context, state) => const MenuScreen()
    ),

    GoRoute(
      path: '/calendarioMenu',
      builder: (context, state) => const CalendarioMenuScreen(),
    ),

    GoRoute(
      path: '/calendario',
      builder: (context, state) => const CalendarioMensalScreen(),
    ),

    GoRoute(
      path: '/materia/:nome',
      builder: (context, state) {
        final nome = state.pathParameters['nome'] ?? 'Matemática';
        return MateriaDetalheScreen(materiaNome: nome);
      },
    ),

    GoRoute(
      path: '/acessibilidade',
      builder: (context, state) => const AccessibilitySettingsScreen(),
    ),
    
  ],
);
