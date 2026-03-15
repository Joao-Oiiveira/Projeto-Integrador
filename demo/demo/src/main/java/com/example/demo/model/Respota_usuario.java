package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Respota_usuario {
    @Id
    private String id;
    @Column
    private String usuario_Id;
    @Column
    private String atributoQuestao;
    @Column
    private boolean acertou;
    @Column
    private String dataResposta;
}
