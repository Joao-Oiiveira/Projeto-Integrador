package com.example.demo.model;


import jakarta.persistence.*;
import java.util.List;

@Entity
@Table
public class Unidade {

    //ID(Chave primaria gerada automaticamente)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String capitulo;

    //Uma unidade para muitas questões
    @OneToMany(mappedBy = "unidade", cascade = CascadeType.ALL)
    private List<Questao> questao;//Isso cria uma lista de alternativas dentro da questão.

    @ManyToOne
    @JoinColumn(name = "Materia_id")
    private Materia materia;


    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCapitulo() {
        return capitulo;
    }

    public void setCapitulo(String capitulo) {
        this.capitulo = capitulo;
    }

    public List<Questao> getQuestao() {
        return questao;
    }

    public void setQuestao(List<Questao> questao) {
        this.questao = questao;
    }

    public Materia getMateria() {
        return materia;
    }

    public void setMateria(Materia materia) {
        this.materia = materia;
    }
}
