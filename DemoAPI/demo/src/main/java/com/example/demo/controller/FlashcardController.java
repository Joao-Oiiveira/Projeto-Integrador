package com.example.demo.controller;


import com.example.demo.model.Flashcard;
import com.example.demo.model.Questao;
import com.example.demo.repository.FlashcardRepository;
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

@RequestMapping(value="/apiFlashcard")
//Define a url que quando for
//requisitada chamará os
//métodos da classe: qualquer
//ação desse controller deve vir
//depois de /apiAluno
public class FlashcardController {

    @Autowired
    FlashcardRepository flashcardRepository;

    //POST
        @PostMapping("/criarFlahscard")
    public void criarFlashcard (@RequestBody Flashcard flashcard){
        flashcardRepository.save(flashcard);
    }
}
