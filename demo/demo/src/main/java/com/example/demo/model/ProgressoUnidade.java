package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class ProgressoUnidade {
    @Id
    private String id;
    @Column
    private String usuario_id;
    @Column
    private String unidade_id;
    @Column
    private float percentual;
    @Column
    private String ultimaAtividade;

    //GET E SET
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsuario_id() {
        return usuario_id;
    }

    public void setUsuario_id(String usuario_id) {
        this.usuario_id = usuario_id;
    }

    public String getUnidade_id() {
        return unidade_id;
    }

    public void setUnidade_id(String unidade_id) {
        this.unidade_id = unidade_id;
    }

    public float getPercentual() {
        return percentual;
    }

    public void setPercentual(float percentual) {
        this.percentual = percentual;
    }

    public String getUltimaAtividade() {
        return ultimaAtividade;
    }

    public void setUltimaAtividade(String ultimaAtividade) {
        this.ultimaAtividade = ultimaAtividade;
    }
}
