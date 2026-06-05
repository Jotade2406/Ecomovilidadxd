#!/bin/bash
# Crea las bases de datos adicionales para los microservicios.
# Este script se ejecuta automáticamente cuando el contenedor postgres
# se inicializa por primera vez (directorio de datos vacío).
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE iam_service'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'iam_service')\gexec

    SELECT 'CREATE DATABASE ai_service'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ai_service')\gexec
EOSQL

echo "Bases de datos iam_service y ai_service verificadas."
