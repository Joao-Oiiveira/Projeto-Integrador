package com.example.demo.model;


import jakarta.persistence.*;

@Entity
@Table
public class Unidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String capitulo;
    @Column
    private String total_questoes_unidade;
    @Column
    private String questoes_erradas_unidade;
    @Column
    private String Questoes_certas_unidade;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCapitulo() {
        return capitulo;
    }

    public void setCapitulo(String capitulo) {
        this.capitulo = capitulo;
    }

    public String getTotal_questoes_unidade() {
        return total_questoes_unidade;
    }

    public void setTotal_questoes_unidade(String total_questoes_unidade) {
        this.total_questoes_unidade = total_questoes_unidade;
    }

    public String getQuestoes_erradas_unidade() {
        return questoes_erradas_unidade;
    }

    public void setQuestoes_erradas_unidade(String questoes_erradas_unidade) {
        this.questoes_erradas_unidade = questoes_erradas_unidade;
    }

    public String getQuestoes_certas_unidade() {
        return Questoes_certas_unidade;
    }

    public void setQuestoes_certas_unidade(String questoes_certas_unidade) {
        Questoes_certas_unidade = questoes_certas_unidade;
    }
}
