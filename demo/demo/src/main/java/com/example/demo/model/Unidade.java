package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Unidade {
    @Id
    private String id;
    @Column
    private String capitulo;
    @Column
    private String total_questoes_unidade;
    @Column
    private String questoes_erradas_unidade;
    @Column
    private String Questoes_certas_unidade;
}
