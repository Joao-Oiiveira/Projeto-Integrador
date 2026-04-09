package com.example.demo.model;


import jakarta.persistence.*;

@Entity
@Table
public class ProgressoUnidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "unidade_id")
    private Unidade unidade;

    private float percentual;
    @Column
    private String ultimaAtividade;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario_id() {
        return usuario;
    }

    public void setUsuario_id(Usuario usuario_id) {
        this.usuario = usuario_id;
    }

    public Unidade getUnidade_id() {
        return unidade;
    }

    public void setUnidade_id(Unidade unidade_id) {
        this.unidade = unidade_id;
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
