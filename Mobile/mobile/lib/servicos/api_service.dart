import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  // Endereço dinâmico da API Python.
  // No Chrome Web: 'http://127.0.0.1:8000'
  // No Emulador Android: 'http://10.0.2.2:8000'
  static String get baseUrl =>
      kIsWeb ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // ===========================================================================
  // AUXILIARES DE CABEÇALHO E REQUISIÇÃO
  // ===========================================================================

  /// Gera os cabeçalhos padrão incluindo o Token JWT para rotas protegidas
  Future<Map<String, String>> _obterHeaders({bool autenticado = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (autenticado) {
      final token = await obterJwtToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // ===========================================================================
  // AUTENTICAÇÃO E CONTA
  // ===========================================================================

  /// Realiza o cadastro tradicional de usuário (POST /auth/registrar)
  Future<Map<String, dynamic>> registrar(
      String nome, String email, String senha) async {
    final url = Uri.parse('$baseUrl/auth/registrar');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: false),
        body: jsonEncode({
          'nome': nome,
          'email': email,
          'senha': senha,
        }),
      );

      return await _processarRespostaAuth(response);
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException(
          'Erro de rede: Não foi possível conectar ao servidor. Verifique se a API está online.');
    }
  }

  /// Realiza o login tradicional de usuário (POST /auth/login)
  Future<Map<String, dynamic>> login(String email, String senha) async {
    final url = Uri.parse('$baseUrl/auth/login');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: false),
        body: jsonEncode({
          'email': email,
          'senha': senha,
        }),
      );

      return await _processarRespostaAuth(response);
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException(
          'Erro de rede: Não foi possível conectar ao servidor. Verifique se a API está online.');
    }
  }

  /// Envia o ID Token do Firebase para a API Python (POST /auth/google)
  Future<Map<String, dynamic>> enviarTokenGoogle(String idToken) async {
    final url = Uri.parse('$baseUrl/auth/google');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: false),
        body: jsonEncode({
          'id_token': idToken,
        }),
      );

      return await _processarRespostaAuth(response);
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException(
          'Erro de rede: Não foi possível conectar ao servidor. Verifique se a API está online.');
    }
  }

  /// Busca os dados completos do usuário logado (GET /auth/me)
  Future<Map<String, dynamic>> obterPerfilLogado() async {
    final url = Uri.parse('$baseUrl/auth/me');
    try {
      final response = await http.get(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao carregar perfil (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao carregar perfil.');
    }
  }

  /// Obter estatísticas do usuário (GET /auth/estatisticas)
  Future<Map<String, dynamic>> obterEstatisticas() async {
    final url = Uri.parse('$baseUrl/auth/estatisticas');
    try {
      final response = await http.get(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao carregar estatísticas (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao carregar estatísticas.');
    }
  }


  /// Salva preferências de onboarding/perfil educacional (POST /auth/onboarding)
  Future<Map<String, dynamic>> salvarOnboarding({
    required String nome,
    required Map<String, dynamic> perfil,
    required Map<String, dynamic> configuracoes,
  }) async {
    final url = Uri.parse('$baseUrl/auth/onboarding');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({
          'nome': nome,
          'perfil': perfil,
          'configuracoes': configuracoes,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao salvar onboarding (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro ao salvar configurações no servidor.');
    }
  }

  // ===========================================================================
  // DISCIPLINAS (MATÉRIAS)
  // ===========================================================================

  /// Listar disciplinas do usuário (GET /disciplinas/)
  Future<List<dynamic>> obterDisciplinas() async {
    final url = Uri.parse('$baseUrl/disciplinas/');
    try {
      final response = await http.get(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw HttpException('Falha ao carregar matérias (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao buscar matérias.');
    }
  }

  /// Criar uma nova matéria (POST /disciplinas/)
  Future<Map<String, dynamic>> criarDisciplina(String nome, String? descricao) async {
    final url = Uri.parse('$baseUrl/disciplinas/');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({
          'nome': nome,
          'descricao': descricao ?? '',
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao criar matéria (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao criar matéria.');
    }
  }

  /// Excluir uma matéria (DELETE /disciplinas/{id})
  Future<void> excluirDisciplina(int id) async {
    final url = Uri.parse('$baseUrl/disciplinas/$id');
    try {
      final response = await http.delete(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode != 204 && response.statusCode != 200) {
        String detail = 'Erro ao excluir matéria.';
        try {
          final errorBody = jsonDecode(utf8.decode(response.bodyBytes));
          if (errorBody['detail'] != null) detail = errorBody['detail'];
        } catch (_) {}
        throw HttpException(detail);
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao excluir matéria.');
    }
  }

  // ===========================================================================
  // TAREFAS
  // ===========================================================================

  /// Listar tarefas do usuário (GET /tarefas/)
  Future<List<dynamic>> obterTarefas() async {
    final url = Uri.parse('$baseUrl/tarefas/');
    try {
      final response = await http.get(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw HttpException('Falha ao carregar tarefas (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao buscar tarefas.');
    }
  }

  /// Criar tarefa (POST /tarefas/)
  Future<Map<String, dynamic>> criarTarefa({
    required int disciplinaId,
    required String titulo,
    required String descricao,
    required String dataEntrega,
  }) async {
    final url = Uri.parse('$baseUrl/tarefas/');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({
          'disciplina_id': disciplinaId,
          'titulo': titulo,
          'descricao': descricao,
          'data_entrega': dataEntrega,
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao criar tarefa (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao criar tarefa.');
    }
  }

  /// Atualizar status da tarefa (PATCH /tarefas/{id}/status)
  Future<Map<String, dynamic>> atualizarStatusTarefa(int tarefaId, String status) async {
    final url = Uri.parse('$baseUrl/tarefas/$tarefaId/status');
    try {
      final response = await http.patch(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({'status': status}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao atualizar tarefa (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao atualizar status da tarefa.');
    }
  }

  /// Excluir tarefa (DELETE /tarefas/{id})
  Future<void> excluirTarefa(int tarefaId) async {
    final url = Uri.parse('$baseUrl/tarefas/$tarefaId');
    try {
      final response = await http.delete(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode != 204 && response.statusCode != 200) {
        throw HttpException('Falha ao excluir tarefa (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao excluir tarefa.');
    }
  }

  // ===========================================================================
  // EVENTOS (CALENDÁRIO)
  // ===========================================================================

  /// Listar eventos do calendário (GET /eventos/)
  Future<List<dynamic>> obterEventos() async {
    final url = Uri.parse('$baseUrl/eventos/');
    try {
      final response = await http.get(
        url,
        headers: await _obterHeaders(autenticado: true),
      );

      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw HttpException('Falha ao carregar eventos (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao buscar eventos.');
    }
  }

  /// Criar evento no calendário (POST /eventos/)
  Future<Map<String, dynamic>> criarEvento({
    required String titulo,
    required String descricao,
    required String dataInicio,
    required String dataFim,
    String? cor,
  }) async {
    final url = Uri.parse('$baseUrl/eventos/');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({
          'titulo': titulo,
          'descricao': descricao,
          'data_inicio': dataInicio,
          'data_fim': dataFim,
          'cor': cor ?? '#3B82F6',
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      } else {
        throw HttpException('Falha ao criar evento (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao criar evento.');
    }
  }
  // ===========================================================================
  // FLASHCARDS
  // ===========================================================================

  Future<List<dynamic>> obterBaralhos() async {
    final url = Uri.parse('$baseUrl/estudos/baralhos');
    try {
      final response = await http.get(url, headers: await _obterHeaders(autenticado: true));
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      } else {
        throw HttpException('Falha ao carregar baralhos (${response.statusCode})');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao buscar baralhos.');
    }
  }

  Future<Map<String, dynamic>> criarBaralho({required String nome, int? disciplinaId}) async {
    final url = Uri.parse('$baseUrl/estudos/baralhos');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({'nome': nome, 'disciplina_id': disciplinaId}),
      );
      if (response.statusCode == 201) return jsonDecode(utf8.decode(response.bodyBytes));
      throw HttpException('Falha ao criar baralho.');
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao criar baralho.');
    }
  }

  Future<void> excluirBaralho(int id) async {
    final url = Uri.parse('$baseUrl/estudos/baralhos/$id');
    try {
      final response = await http.delete(url, headers: await _obterHeaders(autenticado: true));
      if (response.statusCode != 204 && response.statusCode != 200) {
        throw HttpException('Falha ao excluir baralho.');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao excluir baralho.');
    }
  }

  Future<Map<String, dynamic>> criarFlashcard({
    required int baralhoId,
    required String frente,
    required String verso,
  }) async {
    final url = Uri.parse('$baseUrl/estudos/flashcards');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({'baralho_id': baralhoId, 'frente': frente, 'verso': verso}),
      );
      if (response.statusCode == 201) return jsonDecode(utf8.decode(response.bodyBytes));
      throw HttpException('Falha ao criar flashcard.');
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao criar flashcard.');
    }
  }

  Future<List<dynamic>> obterFlashcardsDoBaralho(int baralhoId) async {
    final url = Uri.parse('$baseUrl/estudos/baralhos/$baralhoId/flashcards');
    try {
      final response = await http.get(url, headers: await _obterHeaders(autenticado: true));
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      throw HttpException('Falha ao buscar flashcards.');
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao buscar flashcards.');
    }
  }

  Future<void> excluirFlashcard(int id) async {
    final url = Uri.parse('$baseUrl/estudos/flashcards/$id');
    try {
      final response = await http.delete(url, headers: await _obterHeaders(autenticado: true));
      if (response.statusCode != 204 && response.statusCode != 200) {
        throw HttpException('Falha ao excluir flashcard.');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao excluir flashcard.');
    }
  }

  Future<void> registrarRevisao(int flashcardId, String nivelLembranca) async {
    final url = Uri.parse('$baseUrl/estudos/revisar');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({'flashcard_id': flashcardId, 'nivel_lembranca': nivelLembranca}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw HttpException('Falha ao registrar revisão.');
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao registrar revisão.');
    }
  }

  // ===========================================================================
  // EXERCÍCIOS E IA (TRILHA E TEMPO REAL)
  // ===========================================================================

  Future<Map<String, dynamic>> salvarSessaoExercicio({
    int? disciplinaId,
    String? tema,
    required String modo, // 'vestibular' ou 'ia' ou 'trilha'
    String? dificuldade,
    required int quantidadeQuestoes,
    required List<Map<String, dynamic>> respostas,
  }) async {
    final url = Uri.parse('$baseUrl/exercicios/');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({
          'disciplina_id': disciplinaId,
          'tema': tema,
          'modo': modo,
          'dificuldade': dificuldade,
          'quantidade_questoes': quantidadeQuestoes,
          'respostas': respostas,
        }),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      }
      throw HttpException('Falha ao salvar histórico de exercícios.');
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao salvar exercícios.');
    }
  }

  Future<List<dynamic>> gerarQuestoesIA({
    required String tema,
    int quantidade = 5,
    String nivel = "Médio",
  }) async {
    final url = Uri.parse('$baseUrl/trilha/ia/gerar');
    try {
      final response = await http.post(
        url,
        headers: await _obterHeaders(autenticado: true),
        body: jsonEncode({
          'tema': tema,
          'quantidade': quantidade,
          'nivel': nivel,
        }),
      );
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      }
      throw HttpException('Falha ao gerar questões com IA.');
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao gerar questões com IA.');
    }
  }

  Future<List<dynamic>> obterModulosTrilha(int disciplinaId) async {
    final url = Uri.parse('$baseUrl/trilha/$disciplinaId/modulos');
    try {
      final response = await http.get(url, headers: await _obterHeaders(autenticado: true));
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes, allowMalformed: true)) as List<dynamic>;
      }
      return []; // Retorna lista vazia se não achar ou der erro (para não quebrar a UI)
    } catch (e) {
      return [];
    }
  }

  Future<List<dynamic>> obterQuestoesModulo(int moduloId) async {
    final url = Uri.parse('$baseUrl/trilha/modulo/$moduloId/questoes');
    try {
      final response = await http.get(url, headers: await _obterHeaders(autenticado: true));
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      }
      throw HttpException('Falha ao carregar questões do módulo.');
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException('Erro de conexão ao buscar questões da trilha.');
    }
  }

  // ===========================================================================
  // PROCESSAMENTO DE RESPOSTA AUTH
  // ===========================================================================

  Future<Map<String, dynamic>> _processarRespostaAuth(
      http.Response response) async {
    if (response.statusCode == 200 || response.statusCode == 201) {
      final Map<String, dynamic> data =
          jsonDecode(utf8.decode(response.bodyBytes));

      final String? accessToken = data['access_token'];
      final Map<String, dynamic>? usuario = data['usuario'];

      if (accessToken != null) {
        await _secureStorage.write(key: 'jwt_token', value: accessToken);
      }

      if (usuario != null) {
        final prefs = await SharedPreferences.getInstance();
        if (usuario['nome'] != null) {
          await prefs.setString('userName', usuario['nome'].toString());
        }
        if (usuario['email'] != null) {
          await prefs.setString('userEmail', usuario['email'].toString());
        }
        if (usuario['id'] != null) {
          await prefs.setInt('userId', usuario['id'] as int);
        }
      }

      return data;
    } else {
      String errorDetail = 'E-mail ou senha incorretos.';
      try {
        final errorBody = jsonDecode(utf8.decode(response.bodyBytes));
        final detail = errorBody['detail'];
        if (detail != null) {
          if (detail is String) {
            errorDetail = detail;
          } else if (detail is List && detail.isNotEmpty) {
            final firstError = detail.first;
            if (firstError is Map && firstError['msg'] != null) {
              final msg = firstError['msg'].toString();
              if (msg.contains('@-sign') || msg.contains('valid email')) {
                errorDetail =
                    'Por favor, insira um e-mail válido (ex: seuemail@gmail.com).';
              } else {
                errorDetail = msg;
              }
            }
          }
        }
      } catch (_) {}

      throw HttpException(errorDetail);
    }
  }

  /// Recupera o token JWT de acesso armazenado de forma segura.
  Future<String?> obterJwtToken() async {
    return await _secureStorage.read(key: 'jwt_token');
  }

  /// Limpa todos os dados salvos de login (logout).
  Future<void> limparAutenticacao() async {
    await _secureStorage.delete(key: 'jwt_token');
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userName');
    await prefs.remove('userEmail');
    await prefs.remove('userId');
  }
}

class HttpException implements Exception {
  final String message;
  HttpException(this.message);

  @override
  String toString() => message;
}
