package com.example.demo.model;


import jakarta.persistence.*;

@Entity
@Table
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "unidade_id")//Está criando um coluna chamada unidade_id nessa tabela(FLASHCARD)
    private Unidade unidade;//No postman colocar o nome da variavel(unidade)

    @Column
    private String pergunta;
    @Column
    private String reposta;

    //GET E SET
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPergunta() {
        return pergunta;
    }

    public void setPergunta(String pergunta) {
        this.pergunta = pergunta;
    }

    public String getReposta() {
        return reposta;
    }

    public void setReposta(String reposta) {
        this.reposta = reposta;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    public void setUnidade(Unidade unidade) {
        this.unidade = unidade;
    }
}
