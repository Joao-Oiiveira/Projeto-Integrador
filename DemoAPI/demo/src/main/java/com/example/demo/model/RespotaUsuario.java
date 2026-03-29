package com.example.demo.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table
public class RespotaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String usuario_Id;

    @ManyToOne
    @JoinColumn(name = "questao_id")
    private Questao questao;

    @Column
    private boolean acertou;
    @Column
    private LocalDateTime dataResposta;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuario_Id() {
        return usuario_Id;
    }

    public void setUsuario_Id(String usuario_Id) {
        this.usuario_Id = usuario_Id;
    }

    public boolean isAcertou() {
        return acertou;
    }

    public void setAcertou(boolean acertou) {
        this.acertou = acertou;
    }

    public LocalDateTime getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(LocalDateTime dataResposta) {
        this.dataResposta = dataResposta;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }
}
