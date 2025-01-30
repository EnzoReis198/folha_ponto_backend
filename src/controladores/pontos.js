const knex = require("../conexaoBD");
const { validarEntrada, ajustarFusoHorario } = require("../utils/pontoUtils");
const { format, parseISO, differenceInMinutes, addHours } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");


// const ajustarFusoHorario = (dataISO) => {
//     return new Date(dataISO).toISOString().split("Z")[0];
// };

const registrarPonto = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;
        const { tipo, localizacao, data_hora:data_teste } = req.body;
        // Se for um teste, usamos a data fornecida. Caso contrário, pegamos a data atual.
        const agora = data_teste ? data_teste : new Date();
        const hoje = format(agora, "yyyy-MM-dd");
        //ponto pre programado para testes
        // const entrada_hora = { tipo: "entrada", data_hora: "2025-01-27T08:10:00" }
        // const almoço_inicio_hora = { tipo: "almoço_inicio", data_hora: "2025-01-27T12:00:00" }
        // const almoço_fim_hora = { tipo: "almoço_fim", data_hora: "2025-01-27T14:05:00" }
        // const saida_hora = { tipo: "saída", data_hora: "2025-01-27T18:35:00" }

        
        // const {tipo, data_hora } = entrada_hora;

        // Validar entrada do ponto
        const erroValidacao = validarEntrada(tipo, localizacao);
        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        // Verificar se já existe um ponto do mesmo tipo para o mesmo usuário no mesmo dia
        const pontoExistente = await knex("pontos")
            .where({ id_usuario, tipo })
            .andWhereRaw("DATE(data_hora) = ?", [hoje])
            .first();

        if (pontoExistente) {
            return res.status(400).json({ mensagem: `Ponto de ${tipo} já registrado para hoje.` });
        }

        // Inserir o novo ponto com fuso horário ajustado
        const dataHoraAjustada = ajustarFusoHorario(agora);

        
        
        const [novoPonto] = await knex("pontos")
        .insert({
            id_usuario,
            tipo,
            data_hora: dataHoraAjustada,
            localizacao
        })
        .returning("*");
        const { data_hora, ...resto } = novoPonto;
        const pontosComDataAjustada = {
            ...resto,
            data_hora: ajustarFusoHorario(data_hora)
        };

        // console.log("Data formatada:", pontosComDataAjustada);
        // Registrar no LOG
        await knex("logs").insert({
            id_usuario,
            acao: "Registro de ponto",
            detalhes: `Usuário bateu ponto de ${tipo} em ${localizacao}`,
            data_hora: dataHoraAjustada
        });

        // Se for um ponto de saída, calcular minutos trabalhados e extras
        if (tipo === "saída") {
            const pontosDoDia = await knex("pontos")
                .where({ id_usuario })
                .andWhereRaw("DATE(data_hora) = ?", [hoje])
                .orderBy("data_hora", "asc");

            if (pontosDoDia.length >= 4) {
                const entrada = parseISO(ajustarFusoHorario(pontosDoDia[0].data_hora));
                const almocoInicio = parseISO(ajustarFusoHorario(pontosDoDia[1].data_hora));
                const almocoFim = parseISO(ajustarFusoHorario(pontosDoDia[2].data_hora));
                const saida = parseISO(ajustarFusoHorario(pontosDoDia[3].data_hora));
                
                //debug com console.log
                console.log("entrada: ", entrada)
                console.log("almocoInicio: ", almocoInicio);
                console.log("almocoFim: ", almocoFim);
                console.log("saida: ", saida);


                const minutosTrabalhadosAntesDoAlmoco = differenceInMinutes(almocoInicio, entrada);
                const minutosTrabalhadosDepoisDoAlmoco = differenceInMinutes(saida, almocoFim);
                const minutosAlmoco = differenceInMinutes(almocoFim, almocoInicio);
                
                let minutosTrabalhados = minutosTrabalhadosAntesDoAlmoco + minutosTrabalhadosDepoisDoAlmoco;
                let minutosExtras = 0;
                let minutosAtraso = 0;
                
                //debug com console.log
                console.log("minutosTrabalhadosAntesDoAlmoco: ", minutosTrabalhadosAntesDoAlmoco);
                console.log("minutosTrabalhadosDepoisDoAlmoco: ", minutosTrabalhadosDepoisDoAlmoco);
                console.log("minutosAlmoco: ", minutosAlmoco);


                // Verifica se o tempo de almoço foi menor que 120 minutos (2h)
                if (minutosAlmoco < 120) {
                    minutosExtras += (120 - minutosAlmoco); // Tempo a mais trabalhado vira extra
                }

                // Se o usuário saiu depois do horário, adiciona às horas extras
                if (minutosTrabalhados > 480) {
                    minutosExtras += (minutosTrabalhados - 480);
                    minutosTrabalhados = 480; // Mantém o padrão de 8h diárias (480 minutos)
                }

                // Se houver atraso na entrada ou almoço
                if (entrada > pontosDoDia[0].data_hora) {
                    minutosAtraso += differenceInMinutes(entrada, parseISO(pontosDoDia[0].data_hora));
                }
                if (minutosAlmoco > 120) {
                    minutosAtraso += (minutosAlmoco - 120);
                }

                await knex("horas_trabalhadas").insert({
                    id_usuario,
                    data: knex.fn.now(),
                    minutos_totais: minutosTrabalhados,
                    minutos_extras: minutosExtras
                });

                if (minutosAtraso > 0) {
                    await knex("atrasos").insert({
                        id_usuario,
                        data: knex.fn.now(),
                        minutos_atraso: minutosAtraso
                    });
                }

                //debug com console.log
                console.log("minutosExtras: ", minutosExtras);
                console.log("minutosAtraso: ", minutosAtraso);

                
            }
        }
        
        return res.status(201).json({ mensagem: "Ponto registrado com sucesso!", ponto: pontosComDataAjustada });
    } catch (error) {
        console.error("Erro ao registrar ponto:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = {
    registrarPonto
}