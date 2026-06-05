package com.ecomovilidad.domain.rutas.valueobjects;

import java.util.Map;

/**
 * Representa el estado del ciclo de vida de una Ruta.
 * Patrón Smart Enum implementado como clase con instancias estáticas.
 * Equivalente a EstadoRuta.cs ValueObject en .NET.
 */
public final class EstadoRuta {

    public static final EstadoRuta BORRADOR = new EstadoRuta("Borrador");
    public static final EstadoRuta ACTIVA = new EstadoRuta("Activa");
    public static final EstadoRuta SUSPENDIDA = new EstadoRuta("Suspendida");
    public static final EstadoRuta FINALIZADA = new EstadoRuta("Finalizada");

    private static final Map<String, EstadoRuta> ESTADOS_PERMITIDOS = Map.of(
            BORRADOR.valor, BORRADOR,
            ACTIVA.valor, ACTIVA,
            SUSPENDIDA.valor, SUSPENDIDA,
            FINALIZADA.valor, FINALIZADA
    );

    private final String valor;

    private EstadoRuta(String valor) {
        this.valor = valor;
    }

    /**
     * Factory method desde string. Útil para rehidratación desde persistencia.
     */
    public static EstadoRuta desde(String valor) {
        EstadoRuta estado = ESTADOS_PERMITIDOS.get(valor);
        if (estado == null) {
            throw new IllegalArgumentException(
                    "'" + valor + "' no es un estado de ruta válido. " +
                    "Valores permitidos: " + String.join(", ", ESTADOS_PERMITIDOS.keySet()));
        }
        return estado;
    }

    /**
     * Valida las transiciones de estado permitidas.
     */
    public boolean puedeTransicionarA(EstadoRuta nuevoEstado) {
        if (this.equals(BORRADOR) && nuevoEstado.equals(ACTIVA)) return true;
        if (this.equals(ACTIVA) && nuevoEstado.equals(SUSPENDIDA)) return true;
        if (this.equals(ACTIVA) && nuevoEstado.equals(FINALIZADA)) return true;
        if (this.equals(SUSPENDIDA) && nuevoEstado.equals(ACTIVA)) return true;
        return false;
    }

    public String getValor() {
        return valor;
    }

    @Override
    public String toString() {
        return valor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EstadoRuta that = (EstadoRuta) o;
        return valor.equals(that.valor);
    }

    @Override
    public int hashCode() {
        return valor.hashCode();
    }
}
