package com.example.demo.exception;

public class EmailDuplicadoException extends RuntimeException {
    public EmailDuplicadoException(String mensagem) {
        super(mensagem);
    }
}
