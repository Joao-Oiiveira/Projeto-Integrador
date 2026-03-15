package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Alternativa {
    @Id
    private String id;
    @Column
    private String questao_id;
    @Column
    private String texto;
    @Column
    private String acertou;
    @Column
    private String correta;

}
