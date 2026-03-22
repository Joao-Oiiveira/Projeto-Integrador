package com.example.demo.model;


import jakarta.persistence.*;

@Entity
@Table
public class Compromisso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String usuario_id;
    @Column
    private String materia_id;
    @Column
    private String titulo;
    @Column
    private String tipoCompromisso;
    @Column
    private String obs;
    @Column
    private String data;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuario_id() {
        return usuario_id;
    }

    public void setUsuario_id(String usuario_id) {
        this.usuario_id = usuario_id;
    }

    public String getMateria_id() {
        return materia_id;
    }

    public void setMateria_id(String materia_id) {
        this.materia_id = materia_id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getTipoCompromisso() {
        return tipoCompromisso;
    }

    public void setTipoCompromisso(String tipoCompromisso) {
        this.tipoCompromisso = tipoCompromisso;
    }

    public String getObs() {
        return obs;
    }

    public void setObs(String obs) {
        this.obs = obs;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
