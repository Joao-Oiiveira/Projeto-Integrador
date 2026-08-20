import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/servicos/api_service.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

// ─────────────────────────────────────────────
// Modelos de dados
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
  String nomeUsuario = 'Usuário';
  List<Materia> materias = const [
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
  ];

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

  @override
  void initState() {
    super.initState();
    _gerarDiasDaSemana();
    _carregarDadosDoServidor();
  }

  String _extrairPrimeiroNome(String nomeCompleto) {
    final nomeLimpo = nomeCompleto.trim();
    if (nomeLimpo.isEmpty) return 'Usuário';
    return nomeLimpo.split(' ').first;
  }

  Future<void> _carregarDadosDoServidor() async {
    final prefs = await SharedPreferences.getInstance();
    final rawName = prefs.getString('userName') ?? 'Usuário';
    if (mounted) {
      setState(() {
        nomeUsuario = _extrairPrimeiroNome(rawName);
      });
    }

    try {
      final perfil = await ApiService().obterPerfilLogado();
      if (perfil['nome'] != null && mounted) {
        setState(() {
          nomeUsuario = _extrairPrimeiroNome(perfil['nome'].toString());
        });
      }
    } catch (_) {}


    try {
      final listaDisciplinas = await ApiService().obterDisciplinas();
      if (mounted && listaDisciplinas.isNotEmpty) {
        final coresMaterias = [
          AppColors.matematica,
          AppColors.portugues,
          AppColors.destaque,
          Colors.orange,
          Colors.purple,
        ];

        final List<Materia> materiasCarregadas = [];
        for (int i = 0; i < listaDisciplinas.length; i++) {
          final item = listaDisciplinas[i];
          final discId = item['id'];
          
          int progressoAcertos = 0;
          int progressoTotal = 100;
          
          try {
            final modulosTrilha = await ApiService().obterModulosTrilha(discId);
            final progressoLista = await ApiService().obterProgressoTrilha(discId);
            
            progressoTotal = modulosTrilha.length * 5; // Assumindo 5 por modulo
            if (progressoTotal == 0) progressoTotal = 100;
            
            for (var p in progressoLista) {
               progressoAcertos += (p['acertos'] as int? ?? 0);
            }
          } catch (_) {}

          materiasCarregadas.add(
            Materia(
              nome: item['nome'] ?? 'Matéria',
              cor: coresMaterias[i % coresMaterias.length],
              progresso: progressoAcertos,
              totalItens: progressoTotal,
            ),
          );
        }

        setState(() {
          materias = materiasCarregadas;
        });
      }
    } catch (_) {}

    // Carrega flashcards reais
    try {
      final baralhos = await ApiService().obterBaralhos();
      Map<String, int> contagemPorMateria = {};
      for (var b in baralhos) {
        String materia = b['disciplina'] != null ? b['disciplina']['nome'] : 'Outros';
        final cards = await ApiService().obterFlashcardsDoBaralho(b['id']);
        contagemPorMateria[materia] = (contagemPorMateria[materia] ?? 0) + cards.length;
      }
      
      final cores = [AppColors.matematica, AppColors.portugues, AppColors.destaque, Colors.orange, Colors.purple];
      int colorIndex = 0;
      
      final List<FlashcardResumo> novosFlashcards = [];
      contagemPorMateria.forEach((materia, count) {
        novosFlashcards.add(FlashcardResumo(
          materia: materia,
          cor: cores[colorIndex % cores.length],
          quantidade: count,
        ));
        colorIndex++;
      });
      
      if (mounted) {
        setState(() {
          flashcards = novosFlashcards;
        });
      }
    } catch (_) {}

    // Carrega tarefas reais para o calendário da semana
    try {
      final tarefas = await ApiService().obterTarefas();
      _gerarDiasDaSemanaComTarefas(tarefas);
    } catch (_) {}
  }

  void _gerarDiasDaSemana() {
    _gerarDiasDaSemanaComTarefas([]);
  }

  void _gerarDiasDaSemanaComTarefas(List<dynamic> tarefas) {
    int diaDaSemana = hoje.weekday % 7;
    final inicioDaSemana = hoje.subtract(Duration(days: diaDaSemana));

    if (mounted) {
      setState(() {
        eventosDaSemana = List.generate(7, (index) {
          final dia = inicioDaSemana.add(Duration(days: index));
          
          final eventosNoDia = tarefas.where((t) {
            final dataT = DateTime.parse(t['data_entrega'] ?? DateTime.now().toIso8601String());
            return dataT.day == dia.day && dataT.month == dia.month && dataT.year == dia.year;
          }).map((t) => t['titulo'].toString()).toList();

          return {
            'dia': dia.day.toString().padLeft(2, '0'),
            'mes': dia.month.toString().padLeft(2, '0'),
            'nomeDia': _nomesDias[dia.weekday % 7],
            'isHoje':
                dia.day == hoje.day &&
                dia.month == hoje.month &&
                dia.year == hoje.year,
            'eventos': eventosNoDia,
          };
        });
      });
    }
  }

  // Resumo de flashcards
  List<FlashcardResumo> flashcards = [];


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
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

              // ── Atalhos de Estudo ────────────────────
              Text(
                'Ferramentas de Estudo',
                style: AppTextStyles.subtitulo(context, size: 18.0),
              ),
              const SizedBox(height: 12),
              _buildAtalhosEstudo(),
              const SizedBox(height: 28),

              // ── Matérias (cards empilhados) ──────────
              Text(
                'Matérias',
                style: AppTextStyles.subtitulo(context, size: 18.0),
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
              Text(
                'Flashcards',
                style: AppTextStyles.subtitulo(context, size: 18.0),
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

  // ── Widget: Atalhos de Estudo ──────────────────
  Widget _buildAtalhosEstudo() {
    return Row(
      children: [
        // Atalho: Exercícios
        Expanded(
          child: GestureDetector(
            onTap: () => context.go('/exercicios'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.cardBackground(context),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border(context)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.destaque.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.assignment_outlined,
                      color: AppColors.destaque,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Exercícios',
                          style: AppTextStyles.corpo(context, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Vestibular & IA',
                          style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Atalho: IA
        Expanded(
          child: GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Chat IA contextualizado - Em breve!'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.cardBackground(context),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border(context)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF9C27B0).withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.auto_awesome_outlined,
                      color: Color(0xFFBA68C8),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Assistente IA',
                          style: AppTextStyles.corpo(context, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Tirar dúvidas',
                          style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Widget: Cards Empilhados ─────────────────
  Widget _buildCardsEmpilhados({
    required int itens,
    required bool expandido,
    required VoidCallback onTap,
    required Widget Function(int) buildCard,
    required Widget Function(int) buildCardFechado,
  }) {
    const double cardHeight = 72.0;
    const double offsetEmpilhado = 10.0;
    final altureFechado = cardHeight + (offsetEmpilhado * (itens - 1));

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 1000),
        curve: Curves.easeInOut,
        height: expandido ? (cardHeight + 12) * itens : altureFechado,
        child: Stack(
          clipBehavior: Clip.none,
          children: List.generate(itens, (index) {
            final reverseIndex = itens - 1 - index;

            return AnimatedPositioned(
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOut,
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
  Widget _buildMateriaCardFechado(Materia materia) {
    return GestureDetector(
      onTap: () async {
        setState(() => _materiasExpandidas = true);
        await Future.delayed(const Duration(milliseconds: 1000));
      },
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
              style: AppTextStyles.titulo(context, size: 18.0, color: Colors.white),
            ),
            _buildProgressoCircular(materia.progresso),
          ],
        ),
      ),
    );
  }

  // ── Widget: Card de Matéria ABERTO ───────────
  Widget _buildMateriaCard(Materia materia) {
    return GestureDetector(
      onTap: () async {
        await Future.delayed(const Duration(milliseconds: 150));
        if (mounted) context.go('/materia/${materia.nome}');
      },
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
                  style: AppTextStyles.titulo(context, size: 18.0, color: Colors.white),
                ),
                Text(
                  '${materia.progresso}/${materia.totalItens} concluídos',
                  style: AppTextStyles.legenda(context, color: Colors.white70),
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
    return GestureDetector(
      onTap: () {
        context.go('/flashcard-menu/${flash.materia}');
      },
      child: Container(
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
              style: AppTextStyles.subtitulo(context, size: 16.0, color: Colors.white),
            ),
            Text(
              'Flashcards: ${flash.quantidade}',
              style: AppTextStyles.legenda(context, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  // ── Widget: Card de Flashcard ABERTO ─────────
  Widget _buildFlashcardCard(FlashcardResumo flash) {
    return GestureDetector(
      onTap: () {
        context.go('/flashcard-menu/${flash.materia}');
      },
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
                  style: AppTextStyles.subtitulo(context, size: 16.0, color: Colors.white),
                ),
                Text(
                  'Flashcards: ${flash.quantidade}',
                  style: AppTextStyles.legenda(context, color: Colors.white70),
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
          'Olá, $nomeUsuario',
          style: AppTextStyles.titulo(context, size: 28.0),
        ),
        Row(
          children: [
            // Botão de Acessibilidade
            GestureDetector(
              onTap: () => context.go('/acessibilidade'),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.border(context)),
                  color: AppColors.cardBackground(context),
                ),
                child: Icon(
                  Icons.accessibility_outlined,
                  color: AppColors.textSecondary(context),
                  size: 24,
                ),
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () => context.go('/perfil'),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.border(context)),
                  color: AppColors.cardBackground(context),
                ),
                child: Icon(
                  Icons.person_outline,
                  color: AppColors.textSecondary(context),
                  size: 24,
                ),
              ),
            ),
          ],
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
          color: AppColors.cardBackground(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border(context)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CALENDÁRIO',
              style: AppTextStyles.subtitulo(
                context,
                size: 12.0,
                color: AppColors.textHint(context),
              ).copyWith(letterSpacing: 1.2),
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
                                  ? AppColors.destaque.withOpacity(0.2)
                                  : AppColors.cardSecondary(context),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color:
                                isHoje
                                    ? AppColors.destaque
                                    : AppColors.border(context),
                            width: isHoje ? 1.5 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${diaInfo['dia']}/${diaInfo['mes']} ${diaInfo['nomeDia']}',
                              style: AppTextStyles.legenda(
                                context,
                                color:
                                    isHoje
                                        ? AppColors.destaque
                                        : AppColors.textSecondary(context),
                              ).copyWith(
                                fontWeight: isHoje ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            const SizedBox(height: 6),
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
                                          color: AppColors.destaque,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Expanded(
                                        child: Text(
                                          e,
                                          style: AppTextStyles.legenda(context, color: AppColors.textSecondary(context)),
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
