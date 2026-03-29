package com.example.demo.controller;


import com.example.demo.model.Materia;
import com.example.demo.model.Unidade;
import com.example.demo.repository.MateriaRepository;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//Diz que nossa aplicação é um
//serviço/API REST, ou seja,
//responsável por receber
//requisições e enviar respostas

@RequestMapping(value="/apiMateria")
//Define a url que quando for
//requisitada chamará os
//métodos da classe: qualquer
//ação desse controller deve vir
//depois de /apiAluno
public class MateriaController {

    @Autowired
    MateriaRepository materiaRepository;

    //GET
    @GetMapping(value = "/todasMaterias")
    public List<Materia> listarMateras(){
        return materiaRepository.findAll();
    }

    //POST
    @PostMapping("/criarMateria")
    public void criarMateria (@RequestBody Materia materia){
        materiaRepository.save(materia);
    }
}
