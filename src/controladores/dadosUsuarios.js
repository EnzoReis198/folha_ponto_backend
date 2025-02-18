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

        // Reutilizando funções do utils
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
module.exports = { 
    listarPontosDoUsuario
 };
