import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/tema/app_colors.dart';

// ─────────────────────────────────────────────
// Modelos de dados
// 🔧 BACK-END: Essas classes receberão dados da API via fromJson()
// ─────────────────────────────────────────────
class Materia {
  final String nome;
  final Color cor;
  final int progresso;
  final int totalItens;

  const Materia({
    required this.nome,
    required this.cor,
    required this.progresso,
    required this.totalItens,
  });
}

class FlashcardResumo {
  final String materia;
  final Color cor;
  final int quantidade;

  const FlashcardResumo({
    required this.materia,
    required this.cor,
    required this.quantidade,
  });
}

class EventoDia {
  final String dia;
  final String diaSemana;
  final List<String> eventos;

  const EventoDia({
    required this.dia,
    required this.diaSemana,
    required this.eventos,
  });
}

// ─────────────────────────────────────────────
// Menu Screen
// ─────────────────────────────────────────────
class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  // 🔧 BACK-END: Substituir pelo nome real do usuário logado
  final String nomeUsuario = 'João';

  // Controla se os cards de matérias estão expandidos (abertos)
  bool _materiasExpandidas = false;

  // Controla se os cards de flashcards estão expandidos (abertos)
  bool _flashcardsExpandidos = false;

  // Variaveis para buscar o dia de hoje
  final DateTime hoje = DateTime.now();
  final List<String> _nomesDias = [
    'DOM',
    'SEG',
    'TER',
    'QUA',
    'QUI',
    'SEX',
    'SAB',
  ];
  late List<Map<String, dynamic>> eventosDaSemana;

  //initstate
  @override
  void initState() {
    super.initState();
    _gerarDiasDaSemana();
  }

  void _gerarDiasDaSemana() {
    int diaDaSemana = hoje.weekday % 7;
    final inicioDaSemana = hoje.subtract(Duration(days: diaDaSemana));

    eventosDaSemana = List.generate(7, (index) {
      final dia = inicioDaSemana.add(Duration(days: index));
      return {
        'dia': dia.day.toString().padLeft(2, '0'),
        'mes': dia.month.toString().padLeft(2, '0'),
        'nomeDia': _nomesDias[dia.weekday % 7],
        'isHoje':
            dia.day == hoje.day &&
            dia.month == hoje.month &&
            dia.year == hoje.year,
        // 🔧 BACK-END: Buscar eventos do dia na API
        'eventos': <String>[],
      };
    });
  }

  // 🔧 BACK-END: Buscar matérias do usuário na API
  // Essa lista é dinâmica — cada usuário tem as suas próprias matérias
  final List<Materia> materias = const [
    Materia(
      nome: 'Matemática',
      cor: AppColors.matematica,
      progresso: 10,
      totalItens: 100,
    ),
    Materia(
      nome: 'Português',
      cor: AppColors.portugues,
      progresso: 25,
      totalItens: 100,
    ),
    // 🔧 BACK-END: Novas matérias adicionadas pelo usuário aparecem aqui automaticamente
  ];

  // 🔧 BACK-END: Buscar resumo de flashcards do usuário na API
  final List<FlashcardResumo> flashcards = const [
    FlashcardResumo(
      materia: 'Matemática',
      cor: AppColors.matematica,
      quantidade: 8,
    ),
    FlashcardResumo(
      materia: 'Português',
      cor: AppColors.portugues,
      quantidade: 12,
    ),
    // 🔧 BACK-END: Novos flashcards aparecem aqui automaticamente
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header ───────────────────────────────
              _buildHeader(),
              const SizedBox(height: 24),

              // ── Calendário ───────────────────────────
              _buildCalendario(),
              const SizedBox(height: 28),

              // ── Matérias (cards empilhados) ──────────
              const Text(
                'Matérias',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              _buildCardsEmpilhados(
                itens: materias.length,
                expandido: _materiasExpandidas,
                onTap:
                    () => setState(
                      () => _materiasExpandidas = !_materiasExpandidas,
                    ),
                buildCard: (index) => _buildMateriaCard(materias[index]),
                buildCardFechado:
                    (index) => _buildMateriaCardFechado(materias[index]),
              ),

              const SizedBox(height: 28),

              // ── Flashcards (cards empilhados) ────────
              const Text(
                'Flashcards',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              _buildCardsEmpilhados(
                itens: flashcards.length,
                expandido: _flashcardsExpandidos,
                onTap:
                    () => setState(
                      () => _flashcardsExpandidos = !_flashcardsExpandidos,
                    ),
                buildCard: (index) => _buildFlashcardCard(flashcards[index]),
                buildCardFechado:
                    (index) => _buildFlashcardCardFechado(flashcards[index]),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // ── Widget: Cards Empilhados ─────────────────
  // Quando fechado: cards sobrepostos mostrando só as bordas
  // Quando aberto: todos os cards aparecem separados
  Widget _buildCardsEmpilhados({
    required int itens,
    required bool expandido,
    required VoidCallback onTap,
    required Widget Function(int) buildCard,
    required Widget Function(int) buildCardFechado,
  }) {
    const double cardHeight = 72.0; // altura do card fechado
    const double offsetEmpilhado =
        10.0; // quanto cada card fica visível embaixo

    // Altura total quando fechado — mostra o primeiro card + bordas dos outros
    final altureFechado = cardHeight + (offsetEmpilhado * (itens - 1));

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 1000),
        curve: Curves.easeInOut,
        // Quando aberto: altura suficiente para todos os cards
        // Quando fechado: altura do empilhamento
        height: expandido ? (cardHeight + 12) * itens : altureFechado,
        child: Stack(
          clipBehavior: Clip.none,
          children: List.generate(itens, (index) {
            // Índice invertido — primeiro card fica na frente
            final reverseIndex = itens - 1 - index;

            return AnimatedPositioned(
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOut,
              // Quando aberto: cada card na sua posição
              // Quando fechado: cards empilhados com pequeno offset
              top:
                  expandido
                      ? reverseIndex * (cardHeight + 12)
                      : reverseIndex * offsetEmpilhado,
              left: 0,
              right: 0,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: 1.0,
                child:
                    expandido
                        ? buildCard(reverseIndex)
                        : buildCardFechado(reverseIndex),
              ),
            );
          }),
        ),
      ),
    );
  }

  // ── Widget: Card de Matéria FECHADO ──────────
  // Aparece quando os cards estão empilhados
  Widget _buildMateriaCardFechado(Materia materia) {
    return GestureDetector(
      onTap: () => context.go('/materia/${materia.nome}'),
      child: Container(
        height: 72,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: materia.cor.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              materia.nome,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            _buildProgressoCircular(materia.progresso),
          ],
        ),
      ),
    );
  }

  // ── Widget: Card de Matéria ABERTO ───────────
  // Aparece quando os cards estão expandidos
  Widget _buildMateriaCard(Materia materia) {
    return GestureDetector(
      onTap: () => context.go('/materia/${materia.nome}'),
      child: Container(
        height: 72,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: materia.cor.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  materia.nome,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  // 🔧 BACK-END: progresso e totalItens vêm da API
                  '${materia.progresso}/${materia.totalItens} concluídos',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
            _buildProgressoCircular(materia.progresso),
          ],
        ),
      ),
    );
  }

  // ── Widget: Card de Flashcard FECHADO ────────
  Widget _buildFlashcardCardFechado(FlashcardResumo flash) {
    return Container(
      height: 72,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: flash.cor.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            flash.materia,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            // 🔧 BACK-END: quantidade vem da API
            'Flashcards: ${flash.quantidade}',
            style: const TextStyle(fontSize: 12, color: Colors.white70),
          ),
        ],
      ),
    );
  }

  // ── Widget: Card de Flashcard ABERTO ─────────
  Widget _buildFlashcardCard(FlashcardResumo flash) {
    return GestureDetector(
      //onTap: () {
      // 🔧 BACK-END: Navegar para sessão de flashcards da matéria
      // context.go('/flashcards/${flash.materiaId}');
      //},
      child: Container(
        height: 72,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: flash.cor.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  flash.materia,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Flashcards: ${flash.quantidade}',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
            const Icon(
              Icons.arrow_forward_ios,
              color: Colors.white70,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  // ── Widget: Header ───────────────────────────
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          // 🔧 BACK-END: nomeUsuario vem do usuário logado
          'Olá, $nomeUsuario',
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        GestureDetector(
          onTap: () {
            // 🔧 BACK-END: Navegar para tela de perfil
            // context.go('/perfil');
          },
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white24),
              color: const Color(0xFF1E1E1E),
            ),
            child: const Icon(
              Icons.person_outline,
              color: Colors.white70,
              size: 24,
            ),
          ),
        ),
      ],
    );
  }

  // ── Widget: Calendário ───────────────────────
  Widget _buildCalendario() {
    return GestureDetector(
      onTap: () => context.go('/calendarioMenu'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'CALENDÁRIO',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Colors.white54,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children:
                    eventosDaSemana.map((diaInfo) {
                      final bool isHoje = diaInfo['isHoje'];
                      final List<String> eventos = List<String>.from(
                        diaInfo['eventos'],
                      );
                      return Container(
                        width: isHoje ? 100 : 82,
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color:
                              isHoje
                                  ? const Color(0xFF7EB8F7).withOpacity(0.2)
                                  : const Color(0xFF2A2A2A),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color:
                                isHoje
                                    ? const Color(0xFF7EB8F7)
                                    : Colors.white12,
                            width: isHoje ? 1.5 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${diaInfo['dia']}/${diaInfo['mes']} ${diaInfo['nomeDia']}',
                              style: TextStyle(
                                fontSize: 10,
                                color:
                                    isHoje
                                        ? const Color(0xFF7EB8F7)
                                        : Colors.white54,
                                fontWeight:
                                    isHoje ? FontWeight.w700 : FontWeight.w400,
                              ),
                            ),
                            const SizedBox(height: 6),
                            // 🔧 BACK-END: eventos do dia virão da API
                            if (eventos.isEmpty)
                              const SizedBox(height: 20)
                            else
                              ...eventos.map(
                                (e) => Padding(
                                  padding: const EdgeInsets.only(bottom: 3),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 5,
                                        height: 5,
                                        decoration: const BoxDecoration(
                                          color: Color(0xFFF7A8C4),
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Expanded(
                                        child: Text(
                                          e,
                                          style: const TextStyle(
                                            fontSize: 9,
                                            color: Colors.white70,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Widget: Gráfico circular de progresso ────
  Widget _buildProgressoCircular(int progresso) {
    return SizedBox(
      width: 48,
      height: 48,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            // 🔧 BACK-END: progresso / 100 = valor entre 0.0 e 1.0
            value: progresso / 100,
            strokeWidth: 4,
            backgroundColor: Colors.white24,
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
          ),
          Text(
            '$progresso%',
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
