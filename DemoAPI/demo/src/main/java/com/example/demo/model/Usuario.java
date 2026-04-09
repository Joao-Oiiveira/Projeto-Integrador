package com.example.demo.model;


import jakarta.persistence.*;
import tools.jackson.databind.node.StringNode;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String email;
    @Column
    private String senha;
    @Column
    private LocalDate data_nascimento_;

    @ManyToMany//ver mais sobre isso
    @JoinTable(
            name = "usuario_materia",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    private List<Materia> materias;

    @OneToMany(mappedBy = "usuario")
    private List<Compromisso> compromissos;


    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public LocalDate getData_nascimento_() {
        return data_nascimento_;
    }

    public void setData_nascimento_(LocalDate data_nascimento_) {
        this.data_nascimento_ = data_nascimento_;
    }

    public List<Materia> getMaterias() {
        return materias;
    }

    public void setMaterias(List<Materia> materias) {
        this.materias = materias;
    }

    public List<Compromisso> getCompromissos() {
        return compromissos;
    }

    public void setCompromissos(List<Compromisso> compromissos) {
        this.compromissos = compromissos;
    }
}