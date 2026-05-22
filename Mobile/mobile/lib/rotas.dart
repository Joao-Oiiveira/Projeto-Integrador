import 'package:go_router/go_router.dart';
import 'package:mobile/telas/calendario.dart';
import 'package:mobile/telas/criarConta.dart';
import 'package:mobile/telas/menu.dart';
import 'telas/login.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/cadastro',
      builder: (context, state) => const SignUpScreen(),
    ),
    GoRoute(
      path: '/menu',
      builder: (context, state) => const MenuScreen(),
    ),
    GoRoute(
      path: '/calendario',
      builder: (context, state) => const CalendarioScreen(),
    )
  ],
);