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

  /// Realiza o cadastro tradicional de usuário (POST /auth/registrar)
  Future<Map<String, dynamic>> registrar(
      String nome, String email, String senha) async {
    final url = Uri.parse('$baseUrl/auth/registrar');
    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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
  /// Se a conta NÃO existir no MySQL ou a senha estiver incorreta, o login será BLOQUEADO pela API.
  Future<Map<String, dynamic>> login(String email, String senha) async {
    final url = Uri.parse('$baseUrl/auth/login');
    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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

  /// Envia o ID Token do Firebase para o backend em Python (FastAPI)
  /// e salva o Token JWT local seguro retornado.
  Future<Map<String, dynamic>> enviarTokenGoogle(String idToken) async {
    final url = Uri.parse('$baseUrl/auth/google');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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

  /// Processa a resposta HTTP de autenticação, salva o JWT e os dados do usuário.
  /// Se a conta não for encontrada no banco, lança erro com a mensagem da API.
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
                errorDetail = 'Por favor, insira um e-mail válido (ex: seuemail@gmail.com).';
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
