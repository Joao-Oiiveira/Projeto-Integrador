import 'package:flutter/material.dart';

// ─────────────────────────────────────────────
// Modelo de dados de uma Matéria
// 🔧 BACK-END: Essa classe virá do seu banco de dados/API
// ─────────────────────────────────────────────
class Materia {
  final String nome;
  final Color cor;
  final int progresso;   // 0 a 100 — quanto o usuário já estudou
  final int totalItens;  // total de flashcards/tarefas da matéria

  const Materia({
    required this.nome,
    required this.cor,
    required this.progresso,
    required this.totalItens,
  });
}

// ─────────────────────────────────────────────
// Modelo de dados de um Flashcard resumido
// 🔧 BACK-END: Virá da query de flashcards por matéria
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Modelo de dados de um Evento do Calendário
// 🔧 BACK-END: Virá da query de eventos/tarefas da semana
// ─────────────────────────────────────────────
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
// Dashboard Screen
// ─────────────────────────────────────────────
class Menu extends StatefulWidget {
  const Menu({super.key});

  @override
  State<Menu> createState() => _MenuState();
}

class _MenuState extends State<Menu> {

  // 🔧 BACK-END: Substituir pelo nome real do usuário logado
  // Ex: final String nomeUsuario = AuthService.currentUser.nome;
  final String nomeUsuario = 'João';

  // 🔧 BACK-END: Buscar eventos da semana do banco de dados
  // Ex: final eventos = await AgendaService.getEventosDaSemana();
  final List<EventoDia> eventosDaSemana = const [
    EventoDia(dia: '01/05', diaSemana: 'SEX', eventos: ['Prova Matem.']),
    EventoDia(dia: '02/05', diaSemana: 'SAB', eventos: ['Prova Matem.']),
    EventoDia(dia: '03/05', diaSemana: 'DOM', eventos: ['Prova Port.']),
    EventoDia(dia: '04/05', diaSemana: 'SEG', eventos: ['Lista Mater.', 'Lista Port.']),
  ];

  // 🔧 BACK-END: Buscar matérias do usuário no banco de dados
  // Essa lista é dinâmica — cada usuário tem as suas próprias matérias
  // Ex: final materias = await DisciplinasService.getMateriasByUsuario(userId);
  final List<Materia> materias = const [
    Materia(
      nome: 'Matemática',
      cor: Color(0xFF7EB8F7), // azul pastel
      progresso: 10,
      totalItens: 100,
    ),
    Materia(
      nome: 'Português',
      cor: Color(0xFFF7A8C4), // rosa pastel
      progresso: 25,
      totalItens: 100,
    ),
    // 🔧 BACK-END: Novas matérias adicionadas pelo usuário
    // aparecem aqui automaticamente quando a lista for carregada da API
  ];

  // 🔧 BACK-END: Buscar resumo de flashcards do usuário
  // Ex: final flashcards = await FlashcardsService.getResumoByUsuario(userId);
  final List<FlashcardResumo> flashcards = const [
    FlashcardResumo(
      materia: 'Matemática',
      cor: Color(0xFF7EB8F7),
      quantidade: 8,
    ),
    FlashcardResumo(
      materia: 'Português',
      cor: Color(0xFFF7A8C4),
      quantidade: 12,
    ),
    // 🔧 BACK-END: Novos flashcards aparecem aqui automaticamente
  ];

  // Controla quais cards de matéria estão expandidos
  // Chave = índice da matéria, Valor = true/false
  final Map<int, bool> _materiasExpandidas = {};

  // Controla quais cards de flashcard estão expandidos
  final Map<int, bool> _flashcardsExpandidos = {};

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

              const SizedBox(height: 24),

              // ── Matérias ─────────────────────────────
              const Text(
                'Matérias',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),

              // Lista dinâmica de matérias
              // 🔧 BACK-END: materias.length muda conforme o usuário adiciona/remove
              ...List.generate(materias.length, (index) {
                return _buildMateriaCard(index);
              }),

              const SizedBox(height: 24),

              // ── Flashcards ───────────────────────────
              const Text(
                'Flashcards',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),

              // Lista dinâmica de flashcards
              // 🔧 BACK-END: flashcards.length muda conforme o usuário cria novos
              ...List.generate(flashcards.length, (index) {
                return _buildFlashcardCard(index);
              }),

              const SizedBox(height: 24),
            ],
          ),
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
        // Ícone de perfil
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
    return Container(
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
          // Lista horizontal de dias
          // 🔧 BACK-END: eventosDaSemana vem da API de agenda
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: eventosDaSemana.map((evento) {
                return _buildDiaCalendario(evento);
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // ── Widget: Dia do Calendário ────────────────
  Widget _buildDiaCalendario(EventoDia evento) {
    return Container(
      width: 80,
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${evento.dia} ${evento.diaSemana}',
            style: const TextStyle(
              fontSize: 10,
              color: Colors.white54,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 6),
          // 🔧 BACK-END: eventos da lista vêm da API de agenda do dia
          ...evento.eventos.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 3),
            child: Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
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
          )),
        ],
      ),
    );
  }

  // ── Widget: Card de Matéria (com animação) ───
  Widget _buildMateriaCard(int index) {
    final materia = materias[index];
    final expandido = _materiasExpandidas[index] ?? false;

    return GestureDetector(
      onTap: () {
        setState(() {
          _materiasExpandidas[index] = !expandido;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: materia.cor.withOpacity(0.85),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Linha principal — sempre visível
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        materia.nome,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      // Conteúdo expandido com animação
                      AnimatedSize(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        child: expandido
                            ? Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 8),
                                  Text(
                                    '${materia.progresso}/${materia.totalItens} concluídos',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: Colors.white70,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  // 🔧 BACK-END: Navegar para detalhes da matéria
                                  // context.go('/disciplinas/${materia.id}')
                                  const Text(
                                    'Ver detalhes →',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.white,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ],
                              )
                            : const SizedBox.shrink(),
                      ),
                    ],
                  ),
                  // Gráfico circular de progresso
                  // 🔧 BACK-END: materia.progresso vem do banco de dados
                  _buildProgressoCircular(materia.progresso, materia.cor),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Widget: Card de Flashcard (com animação) ─
  Widget _buildFlashcardCard(int index) {
    final flash = flashcards[index];
    final expandido = _flashcardsExpandidos[index] ?? false;

    return GestureDetector(
      onTap: () {
        setState(() {
          _flashcardsExpandidos[index] = !expandido;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: flash.cor.withOpacity(0.85),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                flash.materia,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                // 🔧 BACK-END: flash.quantidade vem do banco de dados
                'Flashcards: ${flash.quantidade}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                ),
              ),
              // Conteúdo expandido com animação
              AnimatedSize(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                child: expandido
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 8),
                          const Divider(color: Colors.white24),
                          const SizedBox(height: 4),
                          // 🔧 BACK-END: Navegar para sessão de flashcards
                          // context.go('/flashcards/${flash.materiaId}')
                          const Text(
                            'Iniciar revisão →',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Ver todos →',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white70,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      )
                    : const SizedBox.shrink(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Widget: Gráfico circular de progresso ────
  Widget _buildProgressoCircular(int progresso, Color cor) {
    return SizedBox(
      width: 60,
      height: 60,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Círculo de fundo
          CircularProgressIndicator(
            value: progresso / 100,
            // 🔧 BACK-END: progresso / 100 = valor entre 0.0 e 1.0
            strokeWidth: 5,
            backgroundColor: Colors.white24,
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
          ),
          // Texto do percentual
          Text(
            '$progresso%',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}