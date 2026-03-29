package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table
public class Questao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Muitas questões para uma unidade
    @ManyToOne
    @JoinColumn(name = "unidade_id")//Está criando um coluna chamada questao_id nessa tabela(Questao)
    private Unidade unidade;//No postman colocar o nome da variavel(unidade)

    @Column
    private String pergunta;
    @Column
    private String dificuldade;

    //Uma questão para varias alternativas
    @OneToMany(mappedBy = "questao", cascade = CascadeType.ALL)
    private List<Alternativa> alternativas;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Unidade getUnidade_id() {
        return unidade;
    }

    public void setUnidade_id(Unidade unidade) {
        this.unidade = unidade;
    }

    public String getPergunta() {
        return pergunta;
    }

    public void setPergunta(String pergunta) {
        this.pergunta = pergunta;
    }

    public String getDificuldade() {
        return dificuldade;
    }

    public void setDificuldade(String dificuldade) {
        this.dificuldade = dificuldade;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    public void setUnidade(Unidade unidade) {
        this.unidade = unidade;
    }

    public List<Alternativa> getAlternativas() {
        return alternativas;
    }

    public void setAlternativas(List<Alternativa> alternativas) {
        this.alternativas = alternativas;
    }
}
