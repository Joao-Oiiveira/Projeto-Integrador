package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import tools.jackson.databind.node.StringNode;

@Entity
@Table
public class Usuario {

    @Id
    private String id;
    @Column
    private String email;
    @Column
    private String senha;
    @Column
    private String data_nascimento_;

    //GET E SET
    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public String getData_nascimento_() {
        return data_nascimento_;
    }

    public void setData_nascimento_(String data_nascimento_) {
        this.data_nascimento_ = data_nascimento_;
    }
}
