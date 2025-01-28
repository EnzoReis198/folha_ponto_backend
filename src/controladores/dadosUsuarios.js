const knex = require('../conexaoBD.js');
const { ordenarPontos, agruparPontosPorData } = require('../utils/pontoUtils.js');

const listarPontosDoUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;

        // Verificar se o usuário existe
        const usuario = await knex('usuarios').where({ id_usuario }).first();
        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        // Buscar pontos do usuário ordenados por data/hora
        const pontos = await knex('pontos')
            .where({ id_usuario })
            .orderBy('data_hora', 'asc');

        if (pontos.length === 0) {
            return res.status(200).json({ mensagem: "Nenhum ponto encontrado para este usuário." });
        }

        // 📌 Reutilizando funções do utils
        const pontosAgrupados = agruparPontosPorData(pontos);
        const resultadoFinal = ordenarPontos(pontosAgrupados);

        return res.status(200).json({
            id_usuario,
            pontos: resultadoFinal
        });

    } catch (error) {
        console.error("Erro ao listar pontos do usuário:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

const inserirPonto = async (req, res) => {
    try {
        const {id_usuario} = req.usuario; 
        const { tipo, localizacao } = req.body;

        // Lista de locais permitidos
        const locaisPermitidos = ["Loja Matriz Nordeste", "Loja Vale"];

        // Verificar se o tipo de ponto é válido
        const tiposPermitidos = ["entrada", "saída", "almoço_inicio", "almoço_fim"];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({ mensagem: "Tipo de ponto inválido." });
        }

        // Verificar se a localização é válida
        if (!locaisPermitidos.includes(localizacao)) {
            return res.status(400).json({ mensagem: "Localização inválida. Escolha entre: Loja Matriz Nordeste ou Loja Vale." });
        }

        // Definir a data/hora atual no formato correto
        const dataHora = new Date().toISOString();

        // Inserir o ponto no banco de dados
        const novoPonto = await knex("pontos").insert({
            id_usuario,
            tipo,
            data_hora: dataHora,
            localizacao
        }).returning("*");

        return res.status(201).json({ mensagem: "Ponto registrado com sucesso!", ponto: novoPonto[0] });

    } catch (error) {
        console.error("Erro ao inserir ponto do usuário:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = { 
    listarPontosDoUsuario,
    inserirPonto

 };
