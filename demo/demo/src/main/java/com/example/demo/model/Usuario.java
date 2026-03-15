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

}
