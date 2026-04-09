package com.example.demo.model;


import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table
public class Compromisso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String titulo;
    @Enumerated(EnumType.STRING)
    private TipoCompromisso tipoCompromisso;
    @Column
    private String obs;
    @Column
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    private Materia materia;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public TipoCompromisso getTipoCompromisso() {
        return tipoCompromisso;
    }

    public void setTipoCompromisso(TipoCompromisso tipoCompromisso) {
        this.tipoCompromisso = tipoCompromisso;
    }

    public String getObs() {
        return obs;
    }

    public void setObs(String obs) {
        this.obs = obs;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Materia getMateria() {
        return materia;
    }

    public void setMateria(Materia materia) {
        this.materia = materia;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
