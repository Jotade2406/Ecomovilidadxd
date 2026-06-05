package com.ecomovilidad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada principal de EcoMovilidad AI — Backend Java.
 * Migración 1:1 desde .NET 8 Spring Boot 3.3.
 */
@SpringBootApplication
public class EcomovilidadApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcomovilidadApplication.class, args);
    }
}
