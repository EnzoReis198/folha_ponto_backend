const knex = require("../conexaoBD");

const registrarPontos = async (req,res) => {
    try {
        const {id_usuario} = req.usuario; 
        const localizacao = "Loja Matriz Nordeste";

        const pontos = [
            { tipo: "entrada", data_hora: "2025-01-28T08:00:00-03:00" },
            { tipo: "almoço_inicio", data_hora: "2025-01-28T12:00:00-03:00" },
            { tipo: "almoço_fim", data_hora: "2025-01-28T14:00:00-03:00" },
            { tipo: "saída", data_hora: "2025-01-28T18:00:00-03:00" }
        ];

        for (const ponto of pontos) {
            await knex("pontos").insert({
                id_usuario,
                tipo: ponto.tipo,
                data_hora: ponto.data_hora,
                localizacao
            });
        }

        return res.status(200).json({mensagem: "Pontos do dia 28/01/2025 registrados com sucesso!"});
    } catch (error) {
        console.error("Erro ao registrar pontos de teste:", error);
    }
};

const registrarPontosAtrasados = async (req,res) => {
    try {
        const {id_usuario} = req.usuario; 
        const localizacao = "Loja Vale";

        // const data_hora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        // const data_hora = new Date("2025-01-29T20:00:00-03:00");

        const pontos = [
            { tipo: "entrada", data_hora: "2025-01-29T08:10:00-03:00" }, // Entrada atrasada
            { tipo: "almoço_inicio", data_hora: "2025-01-29T12:00:00-03:00" }, // Almoço atrasado
            { tipo: "almoço_fim", data_hora: "2025-01-29T14:05:00-03:00" }, // Retorno atrasado
            { tipo: "saída", data_hora: "2025-01-29T19:35:00-03:00" } // Saída com hora extra
        ];

        for (const ponto of pontos) {
            await knex("pontos").insert({
                id_usuario,
                tipo: ponto.tipo,
                data_hora: ponto.data_hora,
                localizacao
            });
        }
        return res.status(200).json({mensagem: "Pontos do dia  29/01/2025 registrados com sucesso!"});
    } catch (error) {
        console.error("Erro ao registrar pontos de teste:", error);
    }
};

module.exports = {
    registrarPontos,
    registrarPontosAtrasados
};