package com.example.demo.controller;


import com.example.demo.model.Unidade;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
//Diz que nossa aplicação é um
//serviço/API REST, ou seja,
//responsável por receber
//requisições e enviar respostas

@RequestMapping(value="/apiUsuario")
//Define a url que quando for
//requisitada chamará os
//métodos da classe: qualquer
//ação desse controller deve vir
//depois de /apiAluno
public class UsuarioController {

    @Autowired
    UsuarioRepository usuarioRepository;

    //POST
    @PostMapping("/criarUsuario")
    public void criarUsuario (@RequestBody Usuario usuario){
        usuarioRepository.save(usuario);
    }

}
