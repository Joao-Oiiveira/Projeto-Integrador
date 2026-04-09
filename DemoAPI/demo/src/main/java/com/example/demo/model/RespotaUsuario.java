package com.example.demo.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table
public class RespotaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "questao_id")
    private Questao questao;

    @ManyToOne
    @JoinColumn(name = "alternativa_id")
    private Alternativa alternativa;

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

    public Usuario getUsuario_Id() {
        return usuario;
    }

    public void setUsuario_Id(Usuario usuario_Id) {
        this.usuario = usuario_Id;
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Alternativa getAlternativa() {
        return alternativa;
    }

    public void setAlternativa(Alternativa alternativa) {
        this.alternativa = alternativa;
    }
}
