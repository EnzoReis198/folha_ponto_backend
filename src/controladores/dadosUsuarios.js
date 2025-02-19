const knex = require('../conexaoBD.js');
const { ordenarPontos, agruparPontosPorData } = require('../utils/pontoUtils.js');

// const listarPontos = async (req, res) => {
//     try {
//         const {data_hora} = req.query;

//         if(data_hora){
//             // Buscar pontos do usuário ordenados por data/hora
//             const pontos_por_data = await knex('pontos')
//                 .select('u')
//                 .andWhereRaw("DATE(data_hora) = ?", data_hora)
//                 .orderBy('data_hora',"nome", 'asc');
            
//             if (pontos_por_data.length === 0) {
//                 return res.status(200).json({ mensagem: "Nenhum ponto encontrado para este usuário na data solicitada." });
//             }

//                 // Reutilizando funções do utils
//             const pontosAgrupados = agruparPontosPorData(pontos_por_data);
//             const resultadoFinal = ordenarPontos(pontosAgrupados);

//             return res.status(200).json({
//                 ponto: resultadoFinal
//             });

//         }

//         // Buscar pontos do usuário ordenados por data/hora
//         const pontos = await knex('pontos')
//             .orderBy('data_hora',"nome", 'asc');

//         if (pontos.length === 0) {
//             return res.status(200).json({ mensagem: "Nenhum ponto encontrado para este usuário." });
//         }

//         // Reutilizando funções do utils
//         const pontosAgrupados = agruparPontosPorData(pontos);
//         const resultadoFinal = ordenarPontos(pontosAgrupados);

//         return res.status(200).json({
//             pontos: resultadoFinal
//         });

//     } catch (error) {
//         console.error("Erro ao listar pontos do usuário:", error);
//         return res.status(500).json({ mensagem: "Erro interno do servidor." });
//     }
// };
// module.exports = { 
//     listarPontos
//  };

const listarPontos = async (req, res) => {
    try {
        const { id_usuario, page = 1, data_hora } = req.query;
        const limite = 8;
        const offset = (page - 1) * limite;

        if (!id_usuario) {
            return res.status(400).json({ mensagem: "ID do usuário é obrigatório." });
        }

        let query = knex('pontos as p')
            .join('usuarios as u', 'p.id_usuario', 'u.id_usuario')
            .select('u.id_usuario', 'u.nome', 'p.tipo', 'p.data_hora', 'p.localizacao')
            .where('u.administrador', '!=', true)
            .andWhere('u.id_usuario', id_usuario)
            .orderBy('u.nome', 'asc')
            .orderBy('p.id_ponto', 'asc')
            .limit(limite)
            .offset(offset);

        if (data_hora) {
            query = query.andWhereRaw("DATE(p.data_hora) = ?", [data_hora]);
        }

        const pontos = await query;

        if (pontos.length === 0) {
            return res.status(200).json({ mensagem: "Nenhum ponto encontrado para este usuário." });
        }

        return res.status(200).json({ pontos });
    } catch (error) {
        console.error("Erro ao listar pontos do usuário:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = { listarPontos };