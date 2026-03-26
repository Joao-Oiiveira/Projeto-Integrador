package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table
public class Questao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "unidade_id")
    private Unidade unidade;
    @Column
    private String pergunta;
    @Column
    private String dificuldade;
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
}
