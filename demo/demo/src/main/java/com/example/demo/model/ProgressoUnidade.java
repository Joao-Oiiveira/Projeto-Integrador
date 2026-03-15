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
}
