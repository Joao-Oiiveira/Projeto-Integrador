package com.example.demo.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Flashcard {
    @Id
    private String id;
    @Column
    private String pergunta;
    @Column
    private String reposta;
}
