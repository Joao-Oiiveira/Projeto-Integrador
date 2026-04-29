import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Teste API',
      debugShowCheckedModeBanner: false,
      home: TelaUsuarios(),
    );
  }
}

class TelaUsuarios extends StatefulWidget {
  const TelaUsuarios({Key? key}) : super(key: key);

  @override
  State<TelaUsuarios> createState() => _TelaUsuariosState();
}

class _TelaUsuariosState extends State<TelaUsuarios> {
  List usuarios = [];
  bool carregando = true;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _senhaController = TextEditingController();
  DateTime? selectedDate;

  Future buscarUsuarios() async {
    String baseUrl;
    if (kIsWeb) {
      baseUrl = 'http://localhost:8080';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:8080';
    } else {
      baseUrl = 'http://localhost:8080';
    }

    try {
      final response = await http.get(
        Uri.parse("$baseUrl/apiUsuario/usuarios"),
      );

      if (response.statusCode == 200) {
        setState(() {
          usuarios = json.decode(response.body) as List;
          carregando = false;
        });
      } else {
        setState(() {
          carregando = false;
        });
        debugPrint("Erro: ${response.statusCode}");
      }
    } catch (e) {
      setState(() {
        carregando = false;
      });
      debugPrint("Erro de conexão: $e");
    }
  }

  Future criarUsuario(String email, String senha, String dataNascimento) async {
    String baseUrl;
    if (kIsWeb) {
      baseUrl = 'http://localhost:8080';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:8080';
    } else {
      baseUrl = 'http://localhost:8080';
    }

    try {
      final response = await http.post(
        Uri.parse("$baseUrl/apiUsuario/criarUsuario"),
        headers: {"Content-Type": "application/json"},
        body: json.encode({
          "email": email,
          "senha": senha,
          "data_nascimento_": dataNascimento,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        buscarUsuarios(); // Refresh the list
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Usuário criado com sucesso!")),
          );
        }
      } else {
        debugPrint("Erro ao criar: ${response.statusCode}");
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text("Erro ao criar usuário")));
        }
      }
    } catch (e) {
      debugPrint("Erro de conexão: $e");
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Erro de conexão")));
      }
    }
  }

  Future deletarUsuario(int id) async {
    String baseUrl;
    if (kIsWeb) {
      baseUrl = 'http://localhost:8080';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:8080';
    } else {
      baseUrl = 'http://localhost:8080';
    }

    try {
      final response = await http.delete(
        Uri.parse("$baseUrl/apiUsuario/deletar/$id"),
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        buscarUsuarios(); // Refresh the list
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Usuário deletado com sucesso!")),
          );
        }
      } else {
        debugPrint("Erro ao deletar: ${response.statusCode}");
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text("Erro ao deletar usuário")));
        }
      }
    } catch (e) {
      debugPrint("Erro de conexão: $e");
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Erro de conexão")));
      }
    }
  }

  Future atualizarUsuario(
    int id,
    String email,
    String senha,
    String dataNascimento,
  ) async {
    String baseUrl;
    if (kIsWeb) {
      baseUrl = 'http://localhost:8080';
    } else if (Platform.isAndroid) {
      baseUrl = 'http://10.0.2.2:8080';
    } else {
      baseUrl = 'http://localhost:8080';
    }

    try {
      final response = await http.put(
        Uri.parse("$baseUrl/apiUsuario/atualizar/$id"),
        headers: {"Content-Type": "application/json"},
        body: json.encode({
          "email": email,
          "senha": senha,
          "data_nascimento_": dataNascimento,
        }),
      );

      if (response.statusCode == 200) {
        buscarUsuarios(); // Refresh the list
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Usuário atualizado com sucesso!")),
          );
        }
      } else {
        debugPrint("Erro ao atualizar: ${response.statusCode}");
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text("Erro ao atualizar usuário")));
        }
      }
    } catch (e) {
      debugPrint("Erro de conexão: $e");
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Erro de conexão")));
      }
    }
  }

  Future<void> _pickDate() async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        selectedDate = picked;
      });
    }
  }

  void _confirmDelete(int id) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Confirmar Exclusão"),
          content: Text("Tem certeza que deseja deletar este usuário?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Cancelar"),
            ),
            ElevatedButton(
              onPressed: () {
                deletarUsuario(id);
                Navigator.of(context).pop();
              },
              child: Text("Deletar"),
            ),
          ],
        );
      },
    );
  }

  void _showCreateDialog([Map? usuarioToEdit]) {
    if (usuarioToEdit != null) {
      _emailController.text = usuarioToEdit['email'] ?? '';
      _senhaController.text = usuarioToEdit['senha'] ?? '';
      String dataStr = usuarioToEdit['data_nascimento_'] ?? '';
      if (dataStr.isNotEmpty) {
        try {
          selectedDate = DateTime.parse(dataStr);
        } catch (e) {
          selectedDate = null;
        }
      } else {
        selectedDate = null;
      }
    } else {
      _emailController.clear();
      _senhaController.clear();
      selectedDate = null;
    }

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            usuarioToEdit == null ? "Criar Usuário" : "Editar Usuário",
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _emailController,
                decoration: InputDecoration(labelText: "Email"),
              ),
              TextField(
                controller: _senhaController,
                decoration: InputDecoration(labelText: "Senha"),
                obscureText: true,
              ),
              SizedBox(height: 10),
              Text(
                selectedDate == null
                    ? "Selecione a data de nascimento"
                    : "Data: ${selectedDate!.toLocal().toString().split(' ')[0]}",
              ),
              ElevatedButton(
                onPressed: _pickDate,
                child: Text("Selecionar Data"),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Cancelar"),
            ),
            ElevatedButton(
              onPressed: () {
                String email = _emailController.text.trim();
                String senha = _senhaController.text.trim();
                if (email.isNotEmpty &&
                    senha.isNotEmpty &&
                    selectedDate != null) {
                  String data = selectedDate!.toIso8601String().split('T')[0];
                  if (usuarioToEdit == null) {
                    criarUsuario(email, senha, data);
                  } else {
                    atualizarUsuario(usuarioToEdit['id'], email, senha, data);
                  }
                  Navigator.of(context).pop();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Preencha todos os campos")),
                  );
                }
              },
              child: Text(usuarioToEdit == null ? "Criar" : "Atualizar"),
            ),
          ],
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    buscarUsuarios();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Usuários"),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: buscarUsuarios,
            tooltip: "Mostrar Usuários",
          ),
        ],
      ),

      body:
          carregando
              ? Center(child: CircularProgressIndicator())
              : usuarios.isEmpty
              ? Center(child: Text("Nenhum usuário encontrado"))
              : ListView.builder(
                itemCount: usuarios.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(
                      usuarios[index]["email"]?.toString() ?? "Sem email",
                    ),
                    subtitle: Text(
                      "Data: ${usuarios[index]["data_nascimento_"]?.toString() ?? "Não informada"}",
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: Icon(Icons.edit),
                          onPressed: () => _showCreateDialog(usuarios[index]),
                        ),
                        IconButton(
                          icon: Icon(Icons.delete),
                          onPressed:
                              () => _confirmDelete(usuarios[index]["id"]),
                        ),
                      ],
                    ),
                  );
                },
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        tooltip: "Criar Usuário",
        child: Icon(Icons.add),
      ),
    );
  }
}
