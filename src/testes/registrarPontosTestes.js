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

// testes 
//{
//     id.usuario: 1,
//     data_pontos_referencia: 28/01/2025,
//     pontos_referencia: [
//         {
//         "id_ponto": 23,
//         "tipo": "saída",
// 		"data_hora": "2025-01-29T23:00:00.000Z",
// 		"localizacao": "Loja Vale"
//     }, {
//         "id_ponto": 22,
//         "tipo": "almoço_fim",
// 		"data_hora": "2025-01-29T17:45:00.000Z",
// 		"localizacao": "Loja Vale"
//     }, {
//         "id_ponto": 21,
//         "tipo": "almoço_inicio",
// 		"data_hora": "2025-01-29T15:30:00.000Z",
// 		"localizacao": "Loja Vale"
//     }, {
//         "id_ponto": 20,
//         "tipo": "entrada",
// 		"data_hora": "2025-01-29T11:30:00.000Z",
// 		"localizacao": "Loja Vale"
//     }
// ]
// }