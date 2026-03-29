package com.example.demo.model;


import jakarta.persistence.*;

@Entity
@Table
public class Alternativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Muitas alternativas para uma questão
    @ManyToOne
    @JoinColumn(name = "questao_id")//Está criando um coluna chamada questao_id nessa tabela(Alternativa)
    private Questao questao;
    @Column
    private String texto;
    @Column
    private boolean correta;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Questao getQuestao_id() {
        return questao;
    }

    public void setQuestao_id(Questao questao_id) {
        this.questao = questao;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public boolean getCorreta() {
        return correta;
    }

    public void setCorreta(boolean correta) {
        this.correta = correta;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }
}
