const knex = require('../conexaoBD.js');

const verificaAdmin = async (req, res, next) => {
    try {
        const { id_usuario } = req.usuario; 

        // Buscar no banco se o usuário é administrador
        const usuario = await knex('usuarios').where({ id_usuario }).first();

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        if (!usuario.administrador) {
            return res.status(403).json({ mensagem: "Acesso negado. Apenas administradores podem realizar esta ação." });
        }

        next(); 
    } catch (error){
        console.error("Erro no middleware verificaAdmin:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = verificaAdmin;