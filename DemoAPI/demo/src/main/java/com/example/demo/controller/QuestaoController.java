package com.example.demo.controller;

import com.example.demo.model.Alternativa;
import com.example.demo.model.Questao;
import com.example.demo.repository.QuestaoRepository;
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

@RequestMapping(value="/apiQuestao")
//Define a url que quando for
//requisitada chamará os
//métodos da classe: qualquer
//ação desse controller deve vir
//depois de /apiAluno
public class QuestaoController {

    @Autowired
    QuestaoRepository questaoRepository;

    //GET
    @GetMapping(value = "/todasQuestoes")
    public List<Questao> listarQuestao(){
        return questaoRepository.findAll();
    }

    //POST
    @PostMapping("/criarQuestao")
    public void criarQuestao (@RequestBody Questao questao){
        questaoRepository.save(questao);
    }
}
