package com.example.demo.controller;


import com.example.demo.model.Alternativa;
import com.example.demo.model.Unidade;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "*")
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


    //GET
    @GetMapping(value = "/usuarios")
    public List<Usuario> listarUsuario(){
        return usuarioRepository.findAll();
    }

    //POST
    @PostMapping("/criarUsuario")
    public void criarUsuario (@RequestBody Usuario usuario){
        usuarioRepository.save(usuario);
    }

    //Atualizar
    @PutMapping("/atualizar/{id}")
    public Usuario atualizar(@PathVariable Long id, @RequestBody Usuario usuario){
        usuario.setId(id);
        return usuarioRepository.save(usuario);
    }

    //Excluir
    @DeleteMapping("/deletar/{id}")
    public void deletar(@PathVariable int id){
        usuarioRepository.deleteById(id);
    }

}
