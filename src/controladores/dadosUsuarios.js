const knex = require('../conexaoBD.js');

const listarPontosDoUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.usuario; // Obtém o ID do usuário autenticado

        const pontos = await knex('pontos')
            .where({ id_usuario })
            .orderBy('data_hora', 'desc'); // Ordena por data mais recente

        return res.status(200).json(pontos);
    } catch (error) {
        console.error("Erro ao listar pontos do usuário:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = { listarPontosDoUsuario };
