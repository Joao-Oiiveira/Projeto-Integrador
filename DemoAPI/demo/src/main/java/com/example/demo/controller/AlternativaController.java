package com.example.demo.controller;


import com.example.demo.model.Alternativa;
import com.example.demo.repository.AlternativaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.AbstractList;
import java.util.List;


@RestController
//Diz que nossa aplicação é um
//serviço/API REST, ou seja,
//responsável por receber
//requisições e enviar respostas

@RequestMapping(value="/apiAlternativa")
//Define a url que quando for
//requisitada chamará os
//métodos da classe: qualquer
//ação desse controller deve vir
//depois de /apiAluno

public class AlternativaController {

    @Autowired
    AlternativaRepository alternativaRepository;

    @GetMapping(value = "/alternativas")
    public List<Alternativa> listarAlternativa(){
        return alternativaRepository.findAll();
    }

}