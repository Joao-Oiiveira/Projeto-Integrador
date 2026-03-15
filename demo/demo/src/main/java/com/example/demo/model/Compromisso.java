package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Compromisso {
    @Id
    private String id;
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
}
