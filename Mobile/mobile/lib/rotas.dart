import 'package:go_router/go_router.dart';
import 'package:mobile/telas/calendario.dart';
import 'package:mobile/telas/calendarioMenu.dart';
import 'package:mobile/telas/criarConta.dart';
import 'package:mobile/telas/menu.dart';
import 'package:mobile/telas/materiaDetalhe.dart';
import 'package:mobile/telas/accessibility_settings.dart';
import 'package:mobile/telas/login.dart';
import 'package:mobile/telas/perfil_educacional.dart';
import 'package:mobile/telas/exercicios.dart';
import 'package:mobile/telas/exercicios_sessao.dart';
import 'package:mobile/telas/perfil.dart';
import 'package:mobile/telas/flashcard_menu.dart';
import 'package:mobile/telas/criar_flashcard.dart';
import 'package:mobile/telas/flashcard_revisao.dart';

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
      path: '/perfil-educacional',
      builder: (context, state) => const PerfilEducacionalScreen(),
    ),

    GoRoute(
      path: '/perfil',
      builder: (context, state) => const PerfilScreen(),
    ),

    GoRoute(
      path: '/menu',
      builder: (context, state) => const MenuScreen(),
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

    GoRoute(
      path: '/exercicios',
      builder: (context, state) {
        final materia = state.uri.queryParameters['materia'];
        return ExerciciosConfigScreen(materiaInicial: materia);
      },
    ),

    GoRoute(
      path: '/exercicios/sessao',
      builder: (context, state) {
        final materia = state.uri.queryParameters['materia'] ?? 'Matemática';
        final tema = state.uri.queryParameters['tema'] ?? 'Geral';
        final dificuldade = state.uri.queryParameters['dificuldade'] ?? 'Médio';
        final quantidade = int.tryParse(state.uri.queryParameters['quantidade'] ?? '5') ?? 5;
        final modo = state.uri.queryParameters['modo'] ?? 'Vestibular';
        final moduloId = state.uri.queryParameters['modulo_id'];

        return ExerciciosSessaoScreen(
          materia: materia,
          tema: tema,
          dificuldade: dificuldade,
          quantidade: quantidade,
          modo: modo,
          moduloId: moduloId,
        );
      },
    ),

    GoRoute(
      path: '/flashcard-menu/:materia',
      builder: (context, state) {
        final materia = state.pathParameters['materia'] ?? 'Matemática';
        return FlashcardMenuScreen(materia: materia);
      },
    ),

    GoRoute(
      path: '/criar-flashcard/:materia/:deckNome',
      builder: (context, state) {
        final materia = state.pathParameters['materia'] ?? 'Matemática';
        final deckNome = state.pathParameters['deckNome'] ?? 'Geral';
        return CriarFlashcardScreen(materia: materia, deckNome: deckNome);
      },
    ),

    GoRoute(
      path: '/flashcard-revisao/:materia/:deckNome',
      builder: (context, state) {
        final materia = state.pathParameters['materia'] ?? 'Matemática';
        final deckNome = state.pathParameters['deckNome'] ?? 'Geral';
        return FlashcardRevisaoScreen(materia: materia, deckNome: deckNome);
      },
    ),
  ],
);
