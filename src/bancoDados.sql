-- Criar o banco de dados
CREATE DATABASE folha_de_ponto;
\c folha_de_ponto; -- Conectar ao banco criado

-- Criar tabela de usuários
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(155) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    administrador BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de pontos (registro de entrada, saída e horários de almoço)
CREATE TABLE pontos (
    id_ponto SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'saída', 'almoço_inicio', 'almoço_fim')),
    data_hora TIMESTAMPTZ NOT NULL,
    localizacao VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Criar tabela de horas trabalhadas
CREATE TABLE horas_trabalhadas (
    id_horas SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    data DATE NOT NULL,
    horas_totais NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    horas_extras NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Criar tabela de pontos especiais (registro de trabalho em domingos e feriados)
CREATE TABLE pontos_especiais (
    id_ponto_especial SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    data DATE NOT NULL,
    entrada TIMESTAMPTZ NOT NULL,
    saida TIMESTAMPTZ NOT NULL,
    valor_extra NUMERIC(5,2) NOT NULL DEFAULT 50.00, -- Valor fixo de extra para domingos e feriados
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE logs (
    id_log SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    acao TEXT NOT NULL,
    detalhes TEXT NOT NULL,
    data_hora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

CREATE TABLE atrasos (
    id_atrasos SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    data DATE NOT NULL,
    minutos_atraso INT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);



ALTER TABLE horas_trabalhadas 
DROP COLUMN horas_totais,
DROP COLUMN horas_extras,
ADD COLUMN minutos_totais INT NOT NULL DEFAULT 0,
ADD COLUMN minutos_extras INT NOT NULL DEFAULT 0;

-- ALTER TABLE horas_trabalhadas ADD COLUMN minutos_atraso INT DEFAULT 0;

-- Criar tabela de logs administrativos
-- CREATE TABLE logs (
--     id_log SERIAL PRIMARY KEY,
--     id_administrador INT NOT NULL,
--     acao TEXT NOT NULL,
--     data_hora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (id_administrador) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
-- );



            