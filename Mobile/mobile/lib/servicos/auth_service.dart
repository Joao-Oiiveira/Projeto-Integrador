import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:mobile/servicos/api_service.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: kIsWeb
        ? '6151713177-74l21o5ak3g5h6kqh1ae91ssqolqbmee.apps.googleusercontent.com'
        : null,
  );
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ApiService _apiService = ApiService();

  /// Realiza o login tradicional com E-mail e Senha.
  /// Se a conta NÃO existir no MySQL ou a senha estiver incorreta, o login é BLOQUEADO.
  Future<Map<String, dynamic>> loginComEmailESenha(
      String email, String senha) async {
    try {
      return await _apiService.login(email, senha);
    } catch (e) {
      debugPrint("Erro no AuthService.loginComEmailESenha: $e");
      rethrow;
    }
  }

  /// Realiza o cadastro tradicional com Nome, E-mail e Senha no MySQL.
  Future<Map<String, dynamic>> cadastrarUsuario(
      String nome, String email, String senha) async {
    try {
      return await _apiService.registrar(nome, email, senha);
    } catch (e) {
      debugPrint("Erro no AuthService.cadastrarUsuario: $e");
      rethrow;
    }
  }

  /// Executa o fluxo completo do Login com o Google:
  /// 1. Abre o seletor de contas do Google.
  /// 2. Autentica no Firebase com as credenciais obtidas.
  /// 3. Recupera o Firebase ID Token.
  /// 4. Envia o ID Token para a API Python para gerar o token JWT do app.
  Future<Map<String, dynamic>?> loginComGoogle() async {
    try {
      // 1. Abre o seletor de contas do Google
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      // Se o usuário cancelou o Account Picker, retorna nulo
      if (googleUser == null) {
        debugPrint("Login cancelado pelo usuário.");
        return null;
      }

      // 2. Obtém a autenticação do Google (Tokens de acesso e ID)
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // 3. Cria a credencial para o Firebase Auth
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // 4. Efetua o login no Firebase Auth
      final UserCredential userCredential =
          await _auth.signInWithCredential(credential);
      final User? user = userCredential.user;

      if (user == null) {
        throw Exception("Não foi possível autenticar o usuário no Firebase.");
      }

      // 5. Recupera o Firebase ID Token
      final String? firebaseIdToken = await user.getIdToken(true);

      if (firebaseIdToken == null) {
        throw Exception("Falha ao recuperar o ID Token do Firebase.");
      }

      // 6. Envia o Firebase ID Token para a API Python local
      final Map<String, dynamic> apiResponse =
          await _apiService.enviarTokenGoogle(firebaseIdToken);

      return apiResponse;
    } catch (e) {
      debugPrint("Erro no AuthService.loginComGoogle: $e");
      rethrow;
    }
  }

  /// Efetua o Sign Out de todas as contas associadas (Google, Firebase e API)
  Future<void> logout() async {
    try {
      await _googleSignIn.signOut();
      await _auth.signOut();
      await _apiService.limparAutenticacao();
      debugPrint("Sessão finalizada com sucesso.");
    } catch (e) {
      debugPrint("Erro ao deslogar: $e");
      rethrow;
    }
  }
}
