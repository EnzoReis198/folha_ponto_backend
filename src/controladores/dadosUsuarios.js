const knex = require('../conexaoBD.js');

const listarPontosDoUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.usuario; 
        const usuario = await knex('usuarios').where({id_usuario}).first();
        console.log('id do usuario logado: ',usuario)
        if (!usuario) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        const pontos = await knex('pontos')
            .where({ id_usuario })
            .orderBy('data_hora', 'desc'); 

        return res.status(200).json(pontos);
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
