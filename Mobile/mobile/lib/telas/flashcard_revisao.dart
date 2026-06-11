import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';
import 'package:mobile/telas/flashcard_menu.dart'; // Importa o modelo FlashcardDeck

class FlashcardRevisaoScreen extends StatefulWidget {
  final String materia;
  final String deckNome;

  const FlashcardRevisaoScreen({
    super.key,
    required this.materia,
    required this.deckNome,
  });

  @override
  State<FlashcardRevisaoScreen> createState() => _FlashcardRevisaoScreenState();
}

class _FlashcardRevisaoScreenState extends State<FlashcardRevisaoScreen> {
  FlashcardDeck? _deck;
  bool _isLoading = true;
  int _currentIndex = 0;
  bool _isFront = true;
  final Map<int, bool> _starredCards =
      {}; // Guarda o estado da estrela localmente por index

  @override
  void initState() {
    super.initState();
    _loadDeck();
  }

  Future<void> _loadDeck() async {
    final prefs = await SharedPreferences.getInstance();
    final String? decksJson = prefs.getString('flashcard_decks');

    if (decksJson != null) {
      try {
        final List decoded = jsonDecode(decksJson) as List;
        final List<FlashcardDeck> allDecks =
            decoded
                .map(
                  (item) =>
                      FlashcardDeck.fromJson(item as Map<String, dynamic>),
                )
                .toList();

        final deck = allDecks.firstWhere(
          (d) =>
              d.materia.toLowerCase() == widget.materia.toLowerCase() &&
              d.nome.toLowerCase() == widget.deckNome.toLowerCase(),
          orElse:
              () => FlashcardDeck(
                nome: widget.deckNome,
                materia: widget.materia,
                cards: [],
              ),
        );

        setState(() {
          _deck = deck;
          _isLoading = false;
        });
        return;
      } catch (e) {
        // Fallback
      }
    }

    setState(() {
      _deck = FlashcardDeck(
        nome: widget.deckNome,
        materia: widget.materia,
        cards: [],
      );
      _isLoading = false;
    });
  }

  void _flipCard() {
    setState(() {
      _isFront = !_isFront;
    });
  }

  void _responderCard(bool acertou) {
    if (_deck == null) return;

    // Animação/transição para o próximo
    if (_currentIndex < _deck!.cards.length - 1) {
      setState(() {
        _isFront = true; // Reseta para a frente
        _currentIndex++;
      });
    } else {
      _mostrarFimRevisao();
    }
  }

  void _mostrarFimRevisao() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder:
          (context) => AlertDialog(
            backgroundColor: AppColors.cardBackground(context),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Text(
              'Revisão Concluída! 🎉',
              textAlign: TextAlign.center,
              style: AppTextStyles.subtitulo(
                context,
                size: 20.0,
                fontWeight: FontWeight.bold,
              ),
            ),
            content: Text(
              'Parabéns! Você completou a revisão do deck "${widget.deckNome}". Continue assim para fixar o aprendizado!',
              textAlign: TextAlign.center,
              style: AppTextStyles.corpo(context),
            ),
            actions: [
              Center(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Fecha o Dialog
                    context.go(
                      '/flashcard-menu/${widget.materia}',
                    ); // Volta para o menu
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5CCB75),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: const BorderSide(color: Colors.black, width: 1.2),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                  ),
                  child: const Text(
                    'OK',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark
              ? AppColors.backgroundDark
              : Colors.white, // Fundo branco no tema claro conforme mocks
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: isDark ? Colors.white : Colors.black,
            size: 28,
          ),
          onPressed: () => context.go('/flashcard-menu/${widget.materia}'),
        ),
        title: Text(
          widget.deckNome,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child:
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : (_deck == null || _deck!.cards.isEmpty)
                ? _buildEmptyState()
                : _buildRevisaoContent(),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.sentiment_dissatisfied,
              size: 72,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              'Este grupo de flashcards está vazio!',
              textAlign: TextAlign.center,
              style: AppTextStyles.subtitulo(context, size: 18.0),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/flashcard-menu/${widget.materia}'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5CCB75),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Colors.black, width: 1.2),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
              child: const Text(
                'Voltar ao Menu',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRevisaoContent() {
    final card = _deck!.cards[_currentIndex];
    final bool starred = _starredCards[_currentIndex] ?? false;

    return Column(
      children: [
        // Progresso no topo
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Text(
            '${_currentIndex + 1} de ${_deck!.cards.length}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color:
                  Theme.of(context).brightness == Brightness.dark
                      ? Colors.white70
                      : Colors.black54,
            ),
          ),
        ),

        const Spacer(),

        // Card Principal com Giro 3D
        Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 320, maxHeight: 440),
            width: MediaQuery.of(context).size.width * 0.85,
            height: MediaQuery.of(context).size.height * 0.52,
            child: FlipCard(
              isFront: _isFront,
              onTap: _flipCard,
              front: _buildCardFace(
                text: card['pergunta'] ?? '',
                isFront: true,
                starred: starred,
              ),
              back: _buildCardFace(
                text: card['resposta'] ?? '',
                isFront: false,
                starred: starred,
              ),
            ),
          ),
        ),

        const Spacer(),

        // Área de Botões inferiores
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 800),
            child: _isFront ? _buildTapHint() : _buildActionButtons(),
          ),
        ),
      ],
    );
  }

  Widget _buildCardFace({
    required String text,
    required bool isFront,
    required bool starred,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color:
            isFront
                ? const Color(0xFFFFFDF0) // Fundo Creme da Imagem 1
                : const Color(0xFF001133), // Fundo Azul Escuro da Imagem 2
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Ícone de Estrela no topo direito (Estética do mockup)
          Align(
            alignment: Alignment.topRight,
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _starredCards[_currentIndex] = !starred;
                });
              },
              child: Icon(
                starred ? Icons.star : Icons.star_border,
                color:
                    starred
                        ? const Color(0xFFFFD700)
                        : (isFront ? const Color(0xFF001133) : Colors.white),
                size: 28,
              ),
            ),
          ),

          // Texto no centro do card
          Center(
            child: SingleChildScrollView(
              child: Text(
                text,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color:
                      isFront
                          ? const Color(
                            0xFF001133,
                          ) // Letras escuras da Imagem 1
                          : Colors.white, // Letras brancas da Imagem 2
                  height: 1.3,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTapHint() {
    return Container(
      key: const ValueKey('tapHint'),
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.touch_app_outlined,
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? Colors.white70
                    : Colors.black54,
          ),
          const SizedBox(width: 8),
          Text(
            'Toque no card para revelar a resposta',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color:
                  Theme.of(context).brightness == Brightness.dark
                      ? Colors.white70
                      : Colors.black54,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      key: const ValueKey('actionButtons'),
      children: [
        // Botão ERRADO (Vermelho)
        Expanded(
          child: ElevatedButton(
            onPressed: () => _responderCard(false),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE55D5D),
              foregroundColor: Colors.black,
              elevation: 4,
              shadowColor: Colors.black38,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Colors.black, width: 1.2),
              ),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: const Text(
              'ERRADO',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),

        // Botão FÁCIL / OK (Verde)
        Expanded(
          child: ElevatedButton(
            onPressed: () => _responderCard(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF5CCB75),
              foregroundColor: Colors.black,
              elevation: 4,
              shadowColor: Colors.black38,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Colors.black, width: 1.2),
              ),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: const Text(
              'FÁCIL / OK',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class FlipCard extends StatefulWidget {
  final Widget front;
  final Widget back;
  final bool isFront;
  final VoidCallback onTap;

  const FlipCard({
    super.key,
    required this.front,
    required this.back,
    required this.isFront,
    required this.onTap,
  });

  @override
  State<FlipCard> createState() => _FlipCardState();
}

class _FlipCardState extends State<FlipCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(_controller);

    if (!widget.isFront) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant FlipCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isFront != oldWidget.isFront) {
      if (widget.isFront) {
        _controller.reverse();
      } else {
        _controller.forward();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * pi;
          final isFrontSide = angle < pi / 2;

          return Transform(
            transform:
                Matrix4.identity()
                  ..setEntry(3, 2, 0.001) // perspective
                  ..rotateY(
                    angle,
                  ), // Rotaciona o container pai de 0 a 180 graus continuamente
            alignment: Alignment.center,
            child:
                isFrontSide
                    ? widget.front
                    : Transform(
                      transform:
                          Matrix4.identity()..rotateY(
                            pi,
                          ), // Pre-rotaciona o verso para neutralizar o espelhamento do pai
                      alignment: Alignment.center,
                      child: widget.back,
                    ),
          );
        },
      ),
    );
  }
}
