CREATE DATABASE folha_de_ponto;
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(155) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    administrador BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pontos (
    id_ponto SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'saída', 'almoço_inicio', 'almoço_fim')),
    data_hora TIMESTAMP NOT NULL,
    localizacao VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE horas_trabalhadas (
    id_horas SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    data DATE NOT NULL,
    horas_totais NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    horas_extras NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE logs (
    id_log SERIAL PRIMARY KEY,
    id_administrador INT NOT NULL,
    acao TEXT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_administrador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);