import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/tema/app_colors.dart';
import 'package:mobile/tema/app_text_styles.dart';

class FlashcardDeck {
  final String nome;
  final String materia;
  final List<Map<String, String>>
  cards; // [{'pergunta': '...', 'resposta': '...'}]

  FlashcardDeck({
    required this.nome,
    required this.materia,
    required this.cards,
  });

  Map<String, dynamic> toJson() => {
    'nome': nome,
    'materia': materia,
    'cards': cards,
  };

  factory FlashcardDeck.fromJson(Map<String, dynamic> json) {
    return FlashcardDeck(
      nome: json['nome'] as String,
      materia: json['materia'] as String,
      cards: List<Map<String, String>>.from(
        (json['cards'] as List).map(
          (item) => Map<String, String>.from(item as Map),
        ),
      ),
    );
  }
}

class FlashcardMenuScreen extends StatefulWidget {
  final String materia;

  const FlashcardMenuScreen({super.key, required this.materia});

  @override
  State<FlashcardMenuScreen> createState() => _FlashcardMenuScreenState();
}

class _FlashcardMenuScreenState extends State<FlashcardMenuScreen> {
  List<FlashcardDeck> _decks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDecks();
  }

  Future<void> _loadDecks() async {
    final prefs = await SharedPreferences.getInstance();
    final String? decksJson = prefs.getString('flashcard_decks');

    List<FlashcardDeck> loadedDecks = [];
    if (decksJson != null) {
      try {
        final List decoded = jsonDecode(decksJson) as List;
        loadedDecks =
            decoded
                .map(
                  (item) =>
                      FlashcardDeck.fromJson(item as Map<String, dynamic>),
                )
                .toList();
      } catch (e) {
        // Fallback se falhar
      }
    }

    // Filtra decks por matéria
    loadedDecks =
        loadedDecks
            .where(
              (deck) =>
                  deck.materia.toLowerCase() == widget.materia.toLowerCase(),
            )
            .toList();

    // Se a lista estiver vazia, carrega mocks padrão para teste
    if (loadedDecks.isEmpty) {
      if (widget.materia.toLowerCase().contains('port')) {
        loadedDecks = [
          FlashcardDeck(
            nome: 'Fonetica',
            materia: widget.materia,
            cards: [
              {
                'pergunta': 'O que é um Fonema?',
                'resposta': 'É a menor unidade sonora da fala.',
              },
              {
                'pergunta': 'O que é um Dígrafo?',
                'resposta':
                    'Duas letras que representam um único fonema (ex: ch, lh, rr).',
              },
              {
                'pergunta': 'Qual a diferença de vogal e semivogal?',
                'resposta':
                    'A vogal é o som mais forte da sílaba. A semivogal é o som mais fraco.',
              },
            ],
          ),
          FlashcardDeck(
            nome: 'Estrutura verbal',
            materia: widget.materia,
            cards: [
              {
                'pergunta': 'O que é o Radical?',
                'resposta':
                    'Elemento base que contém o significado principal do verbo.',
              },
              {
                'pergunta': 'O que é a Vogal Temática?',
                'resposta':
                    'Indica a conjugação a que o verbo pertence (A, E ou I).',
              },
            ],
          ),
          FlashcardDeck(
            nome: 'Substantivo',
            materia: widget.materia,
            cards: [
              {
                'pergunta': 'O que é um substantivo concreto?',
                'resposta':
                    'Nomeia seres com existência própria, reais ou imaginários.',
              },
              {
                'pergunta': 'Substantivo abstrato?',
                'resposta': 'Nomeia sentimentos, estados, ações ou qualidades.',
              },
              {
                'pergunta': 'Exemplo de substantivo coletivo?',
                'resposta': 'Alcatéia (lobos), Arquipélago (ilhas).',
              },
              {
                'pergunta': 'Substantivo primitivo?',
                'resposta':
                    'Não deriva de nenhuma outra palavra (ex: pedra, flor).',
              },
              {
                'pergunta': 'Substantivo derivado?',
                'resposta':
                    'Substantivo que se origina de outra palavra (ex: pedreira, floricultura).',
              },
            ],
          ),
          FlashcardDeck(
            nome: 'Tema',
            materia: widget.materia,
            cards: [
              {
                'pergunta': 'O que é Conotação?',
                'resposta': 'Uso de palavra no sentido figurado.',
              },
              {
                'pergunta': 'O que é Denotação?',
                'resposta': 'Uso de palavra no sentido real, do dicionário.',
              },
              {
                'pergunta': 'Exemplo de Hipérbole?',
                'resposta': '"Estou morrendo de fome" (um exagero).',
              },
              {
                'pergunta': 'Exemplo de Eufemismo?',
                'resposta': '"Ele partiu desta para melhor" (suavização).',
              },
            ],
          ),
        ];
      } else {
        loadedDecks = [
          FlashcardDeck(
            nome: 'Funções de 1º Grau',
            materia: widget.materia,
            cards: [
              {
                'pergunta': 'Fórmula geral da função afim?',
                'resposta': 'f(x) = ax + b',
              },
              {
                'pergunta': 'O que representa o coeficiente "a"?',
                'resposta': 'A taxa de variação ou inclinação da reta.',
              },
              {
                'pergunta': 'O que representa o coeficiente "b"?',
                'resposta': 'O coeficiente linear, onde a reta corta o eixo y.',
              },
            ],
          ),
          FlashcardDeck(
            nome: 'Equações Quadráticas',
            materia: widget.materia,
            cards: [
              {
                'pergunta': 'Fórmula de Bhaskara?',
                'resposta': 'x = (-b ± √Δ) / 2a',
              },
              {
                'pergunta': 'Como calcula o Delta (Δ)?',
                'resposta': 'Δ = b² - 4ac',
              },
            ],
          ),
        ];
      }
      // Salva no SharedPreferences
      await _salvarDecksGlobais(loadedDecks);
    }

    setState(() {
      _decks = loadedDecks;
      _isLoading = false;
    });
  }

  Future<void> _salvarDecksGlobais(List<FlashcardDeck> decksDaMateria) async {
    final prefs = await SharedPreferences.getInstance();
    final String? decksJson = prefs.getString('flashcard_decks');

    List<FlashcardDeck> todosDecks = [];
    if (decksJson != null) {
      try {
        final List decoded = jsonDecode(decksJson) as List;
        todosDecks =
            decoded
                .map(
                  (item) =>
                      FlashcardDeck.fromJson(item as Map<String, dynamic>),
                )
                .toList();
      } catch (e) {}
    }

    // Remove decks antigos desta matéria para atualizar
    todosDecks.removeWhere(
      (deck) => deck.materia.toLowerCase() == widget.materia.toLowerCase(),
    );
    todosDecks.addAll(decksDaMateria);

    await prefs.setString(
      'flashcard_decks',
      jsonEncode(todosDecks.map((d) => d.toJson()).toList()),
    );
  }

  void _abrirCriarGrupoDialog() {
    final TextEditingController nomeController = TextEditingController();

    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (context) => Dialog(
            backgroundColor: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.all(24),
              constraints: const BoxConstraints(maxWidth: 340),
              decoration: BoxDecoration(
                color:
                    Theme.of(context).brightness == Brightness.dark
                        ? AppColors.cardBackgroundDark
                        : const Color(
                          0xFFD9D9D9,
                        ), // Cinza claro conforme Imagem 2
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color:
                      Theme.of(context).brightness == Brightness.dark
                          ? AppColors.borderDark
                          : Colors.black26,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Criar grupo de flashcards',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color:
                          Theme.of(context).brightness == Brightness.dark
                              ? Colors.white
                              : Colors
                                  .black, // Letras pretas em destaque no popup
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Input com bordas no padrão da imagem 2
                  TextField(
                    controller: nomeController,
                    autofocus: true,
                    style: TextStyle(
                      color:
                          Theme.of(context).brightness == Brightness.dark
                              ? Colors.white
                              : Colors.black,
                    ),
                    decoration: InputDecoration(
                      labelText: 'Materia', // Label exato da Imagem 2
                      labelStyle: TextStyle(
                        color:
                            Theme.of(context).brightness == Brightness.dark
                                ? Colors.white70
                                : Colors.black87,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color:
                              Theme.of(context).brightness == Brightness.dark
                                  ? Colors.white38
                                  : Colors
                                      .black, // Borda preta firme conforme Imagem 2
                          width: 1.2,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color:
                              Theme.of(context).brightness == Brightness.dark
                                  ? Colors.white
                                  : Colors.black,
                          width: 1.8,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 14,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Botões no padrão da imagem 2
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(
                              0xFFE55D5D,
                            ), // Cancelar (Vermelho da Imagem 2)
                            foregroundColor:
                                Colors
                                    .black, // Letras pretas/escuras destacadas
                            elevation: 4,
                            shadowColor: Colors.black38,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: const BorderSide(
                                color: Colors.black,
                                width: 1.2,
                              ),
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
                            if (nomeController.text.trim().isNotEmpty) {
                              _criarNovoGrupo(nomeController.text.trim());
                            }
                            Navigator.pop(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(
                              0xFF5CCB75,
                            ), // Confirmar (Verde da Imagem 2)
                            foregroundColor:
                                Colors
                                    .black, // Letras pretas/escuras destacadas
                            elevation: 4,
                            shadowColor: Colors.black38,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: const BorderSide(
                                color: Colors.black,
                                width: 1.2,
                              ),
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

  void _criarNovoGrupo(String nome) async {
    final novoDeck = FlashcardDeck(
      nome: nome,
      materia: widget.materia,
      cards: [],
    );

    setState(() {
      _decks.insert(0, novoDeck);
    });

    await _salvarDecksGlobais(_decks);
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios,
            color: AppColors.textPrimary(context),
          ),
          onPressed: () => context.go('/materia/${widget.materia}'),
        ),
        title: Text(
          'Menu de Flashcards',
          style: AppTextStyles.subtitulo(context, size: 18.0),
        ),
      ),
      body: SafeArea(
        child:
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 16),

                    // ── TÍTULO DA MATÉRIA (Pill azul conforme Imagem 1) ──
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 48,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(
                            0xFF0088FF,
                          ), // Pill azul firme conforme a imagem
                          borderRadius: BorderRadius.circular(28),
                        ),
                        child: Text(
                          widget.materia,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color:
                                Colors
                                    .black, // Texto escuro na pílula conforme Imagem 1
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ── BOTÃO ADICIONAR (+) conforme Imagem 1 ──
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        iconSize: 36,
                        icon: const Icon(
                          Icons.add_circle_outline_outlined,
                          color: Colors.white,
                        ),
                        onPressed: _abrirCriarGrupoDialog,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // ── LISTA DOS DECKS DE FLASHCARDS ──
                    Expanded(
                      child:
                          _decks.isEmpty
                              ? Center(
                                child: Text(
                                  'Nenhum grupo de flashcards criado.\nClique no botão + acima para criar um!',
                                  textAlign: TextAlign.center,
                                  style: AppTextStyles.corpo(
                                    context,
                                    color: AppColors.textSecondary(context),
                                  ),
                                ),
                              )
                              : ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 8,
                                ),
                                itemCount: _decks.length,
                                itemBuilder: (context, index) {
                                  final deck = _decks[index];
                                  return Padding(
                                    padding: const EdgeInsets.only(
                                      bottom: 18.0,
                                    ),
                                    child: _buildDeckCard(deck),
                                  );
                                },
                              ),
                    ),
                  ],
                ),
      ),
    );
  }

  // Card no padrão visual da Imagem 1
  Widget _buildDeckCard(FlashcardDeck deck) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0088FF), // Fundo azul do card principal
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black, width: 1.5),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Área Superior Azul (Clicar aqui vai para Criar/Editar Flashcards - Imagem 3)
          GestureDetector(
            onTap: () {
              // Navega para a tela de editar/ver os flashcards (Imagem 3)
              context.go('/criar-flashcard/${widget.materia}/${deck.nome}');
            },
            child: Container(
              color: Colors.transparent,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    deck.nome,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black, // Letras pretas conforme a Imagem 1
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Flashcards: ${deck.cards.length}',
                    style: const TextStyle(fontSize: 12, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ),

          // Área Inferior Verde ("Iniciar revisão" - Imagem 1)
          GestureDetector(
            onTap: () {
              if (deck.cards.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Este grupo não possui flashcards cadastrados!'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              } else {
                context.go('/flashcard-revisao/${widget.materia}/${deck.nome}');
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFF5CCB75), // Verde conforme Imagem 1
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(14),
                ),
                border: Border(
                  top: BorderSide(color: Colors.black, width: 1.5),
                ),
              ),
              child: const Center(
                child: Text(
                  'Iniciar revisão',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
