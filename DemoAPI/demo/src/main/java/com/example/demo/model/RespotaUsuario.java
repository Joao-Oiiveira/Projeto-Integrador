package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class RespotaUsuario {
    @Id
    private String id;
    @Column
    private String usuario_Id;
    @Column
    private String atributoQuestao;
    @Column
    private boolean acertou;
    @Column
    private String dataResposta;

    //GET E SET
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsuario_Id() {
        return usuario_Id;
    }

    public void setUsuario_Id(String usuario_Id) {
        this.usuario_Id = usuario_Id;
    }

    public String getAtributoQuestao() {
        return atributoQuestao;
    }

    public void setAtributoQuestao(String atributoQuestao) {
        this.atributoQuestao = atributoQuestao;
    }

    public boolean isAcertou() {
        return acertou;
    }

    public void setAcertou(boolean acertou) {
        this.acertou = acertou;
    }

    public String getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(String dataResposta) {
        this.dataResposta = dataResposta;
    }

}
