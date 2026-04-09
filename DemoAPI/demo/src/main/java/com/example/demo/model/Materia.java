package com.example.demo.model;


import jakarta.persistence.*;

import java.util.List;

@Entity
@Table
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String nome;
    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL)
    private List<Unidade> unidades;
    @ManyToMany(mappedBy = "materias")
    private List<Usuario> usuarios;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public List<Unidade> getUnidades() {
        return unidades;
    }

    public void setUnidades(List<Unidade> unidades) {
        this.unidades = unidades;
    }
}
