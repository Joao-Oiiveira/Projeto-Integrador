package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Questao {
    @Id
    private String id;
    @Column
    private String unidade_id;
    @Column
    private String pergunta;
    @Column
    private String dificuldade;

    //GET E SET
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUnidade_id() {
        return unidade_id;
    }

    public void setUnidade_id(String unidade_id) {
        this.unidade_id = unidade_id;
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
