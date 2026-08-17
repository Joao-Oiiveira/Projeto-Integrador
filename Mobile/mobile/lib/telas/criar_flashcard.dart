import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/servicos/api_service.dart';
import 'package:mobile/telas/flashcard_menu.dart'; // Reutiliza o modelo FlashcardDeck
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

class CriarFlashcardScreen extends StatefulWidget {
  final String materia;
  final String deckNome;

  const CriarFlashcardScreen({
    super.key,
    required this.materia,
    required this.deckNome,
  });

  @override
  State<CriarFlashcardScreen> createState() => _CriarFlashcardScreenState();
}

class _CriarFlashcardScreenState extends State<CriarFlashcardScreen> {
  FlashcardDeck? _deck;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDeck();
  }

  Future<void> _loadDeck() async {
    try {
      final fetchedDecks = await ApiService().obterBaralhos();
      final targetBaralho = fetchedDecks.cast<Map<String, dynamic>?>().firstWhere(
        (d) => d != null && 
               (d['disciplina'] != null ? d['disciplina']['nome'] : '').toString().toLowerCase() == widget.materia.toLowerCase() &&
               d['nome'].toString().toLowerCase() == widget.deckNome.toLowerCase(),
        orElse: () => null,
      );

      if (targetBaralho != null) {
        final fetchedCards = await ApiService().obterFlashcardsDoBaralho(targetBaralho['id']);
        final cardsList = fetchedCards.map((c) => {
          'id': c['id'].toString(),
          'pergunta': c['pergunta'].toString(),
          'resposta': c['resposta'].toString()
        }).toList();

        if (mounted) {
          setState(() {
            _deck = FlashcardDeck(
              id: targetBaralho['id'],
              nome: targetBaralho['nome'],
              materia: targetBaralho['disciplina'] != null ? targetBaralho['disciplina']['nome'] : '',
              cards: cardsList,
            );
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _deck = FlashcardDeck(nome: widget.deckNome, materia: widget.materia, cards: []);
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _salvarDeck() async {
    // Agora salvar é feito individualmente em _adicionarCard e _removerCard
  }

  void _abrirCriarCardDialog() {
    final TextEditingController perguntaController = TextEditingController();
    final TextEditingController respostaController = TextEditingController();

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(24),
          constraints: const BoxConstraints(maxWidth: 340),
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.cardBackgroundDark
                : const Color(0xFFD9D9D9), // Mesmo cinza claro da Imagem 2
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.borderDark
                  : Colors.black26,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Adicionar FlashCards',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : Colors.black,
                ),
              ),
              const SizedBox(height: 24),
              
              // Campo Pergunta
              TextField(
                controller: perguntaController,
                autofocus: true,
                style: TextStyle(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : Colors.black,
                ),
                decoration: InputDecoration(
                  labelText: 'Pergunta',
                  labelStyle: TextStyle(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white70
                        : Colors.black87,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.white38
                          : Colors.black,
                      width: 1.2,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.white
                          : Colors.black,
                      width: 1.8,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
              ),
              const SizedBox(height: 16),

              // Campo Resposta
              TextField(
                controller: respostaController,
                style: TextStyle(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : Colors.black,
                ),
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Resposta',
                  labelStyle: TextStyle(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white70
                        : Colors.black87,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.white38
                          : Colors.black,
                      width: 1.2,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.white
                          : Colors.black,
                      width: 1.8,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
              ),
              const SizedBox(height: 24),
              
              // Botões no padrão da imagem de popup
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE55D5D), // Cancelar (Vermelho)
                        foregroundColor: Colors.black,
                        elevation: 4,
                        shadowColor: Colors.black38,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Colors.black, width: 1.2),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text(
                        'CANCELAR',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        if (perguntaController.text.trim().isNotEmpty &&
                            respostaController.text.trim().isNotEmpty) {
                          _adicionarCard(
                            perguntaController.text.trim(),
                            respostaController.text.trim(),
                          );
                        }
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5CCB75), // Confirmar (Verde)
                        foregroundColor: Colors.black,
                        elevation: 4,
                        shadowColor: Colors.black38,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Colors.black, width: 1.2),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text(
                        'CONFIRMAR',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _adicionarCard(String pergunta, String resposta) async {
    if (_deck == null || _deck!.id == null) return;

    setState(() => _isLoading = true);
    try {
      await ApiService().criarFlashcard(
        baralhoId: _deck!.id!,
        frente: pergunta,
        verso: resposta,
      );
      await _loadDeck(); // Refresh to get the new card with its ID
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao adicionar flashcard: $e')),
        );
      }
    }
  }

  void _removerCard(int index) async {
    if (_deck == null || _deck!.id == null) return;
    
    final card = _deck!.cards[index];
    final cardId = card['id'];
    
    if (cardId != null) {
      setState(() => _isLoading = true);
      try {
        await ApiService().excluirFlashcard(int.parse(cardId));
        await _loadDeck();
      } catch (e) {
        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erro ao remover flashcard: $e')),
          );
        }
      }
    }
  }


  // Mostra modal para visualizar a resposta de um card individual ao clicar
  void _mostrarDetalheCard(Map<String, String> card, int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground(context),
        title: Text('Detalhes do Flashcard', style: AppTextStyles.subtitulo(context, size: 18.0, fontWeight: FontWeight.bold)),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Pergunta:', style: AppTextStyles.legenda(context, color: AppColors.destaque).copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(card['pergunta']!, style: AppTextStyles.subtitulo(context, size: 15.0)),
            const SizedBox(height: 16),
            Text('Resposta:', style: AppTextStyles.legenda(context, color: AppColors.correto).copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(card['resposta']!, style: AppTextStyles.corpo(context)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _removerCard(index);
            },
            child: const Text('EXCLUIR', style: TextStyle(color: AppColors.incorreto, fontWeight: FontWeight.bold)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('FECHAR', style: TextStyle(color: AppColors.textPrimary(context), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: AppColors.textPrimary(context)),
          onPressed: () => context.go('/flashcard-menu/${widget.materia}'),
        ),
        title: Text(
          'Criar Flashcard',
          style: AppTextStyles.subtitulo(context, size: 18.0),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 16),
                  
                  // ── TÍTULO DO DECK (Pill azul conforme Imagem 3) ──
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0088FF), // Pill azul conforme Imagem 3
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: Text(
                        widget.deckNome,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black, // Letras pretas conforme a Imagem 3
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // ── BOTÃO CRIAR CARDS (Verde conforme Imagem 3) ──
                  Center(
                    child: ElevatedButton(
                      onPressed: _abrirCriarCardDialog,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5CCB75), // Verde conforme Imagem 3
                        foregroundColor: Colors.black,
                        elevation: 3,
                        shadowColor: Colors.black38,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Colors.black, width: 1.5),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                      ),
                      child: const Text(
                        'Criar cards',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // ── LISTA DOS CARDS DO DECK (Azul conforme Imagem 3) ──
                  Expanded(
                    child: _deck!.cards.isEmpty
                        ? Center(
                            child: Text(
                              'Nenhum card cadastrado neste grupo.\nClique em "Criar cards" acima para adicionar!',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.corpo(context, color: AppColors.textSecondary(context)),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                            itemCount: _deck!.cards.length,
                            itemBuilder: (context, index) {
                              final card = _deck!.cards[index];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 14.0),
                                child: GestureDetector(
                                  onTap: () => _mostrarDetalheCard(card, index),
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0088FF), // Azul dos cards conforme Imagem 3
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.black, width: 1.5),
                                    ),
                                    child: Text(
                                      card['pergunta']!,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.black, // Texto escuro conforme Imagem 3
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                  
                  // ── BOTÃO DE REVISÃO GERAL (INICIAR) NO RODAPÉ conforme Imagem 3 ──
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: ElevatedButton(
                      onPressed: () {
                        if (_deck == null || _deck!.cards.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Este grupo não possui flashcards cadastrados!'),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        } else {
                          context.go('/flashcard-revisao/${widget.materia}/${widget.deckNome}');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5CCB75), // Verde conforme Imagem 3
                        foregroundColor: Colors.black,
                        elevation: 3,
                        shadowColor: Colors.black38,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Colors.black, width: 1.5),
                        ),
                      ),
                      child: const Text(
                        'INICIAR',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
