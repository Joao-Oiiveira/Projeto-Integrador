package com.example.demo.model;


import jakarta.persistence.*;

@Entity
@Table
public class Alternativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String questao_id;
    @Column
    private String texto;
    @Column
    private String acertou;
    @Column
    private String correta;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestao_id() {
        return questao_id;
    }

    public void setQuestao_id(String questao_id) {
        this.questao_id = questao_id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public String getAcertou() {
        return acertou;
    }

    public void setAcertou(String acertou) {
        this.acertou = acertou;
    }

    public String getCorreta() {
        return correta;
    }

    public void setCorreta(String correta) {
        this.correta = correta;
    }
}
