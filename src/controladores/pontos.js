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
            //define horarios fixos
            const horario_entrada_fixo = ajustarFusoHorario(`${hoje}T08:00:00`);
            const horario_saida_fixo = ajustarFusoHorario(`${hoje}T18:00:00`);
            const pontosDoDia = await knex("pontos")
                .where({ id_usuario })
                .andWhereRaw("DATE(data_hora) = ?", [hoje])
                .orderBy("data_hora", "asc");

            if (pontosDoDia.length >= 4) {
                const entrada = ajustarFusoHorario(pontosDoDia[0].data_hora);
                const almocoInicio = ajustarFusoHorario(pontosDoDia[1].data_hora);
                const almocoFim = ajustarFusoHorario(pontosDoDia[2].data_hora);
                const saida = ajustarFusoHorario(pontosDoDia[3].data_hora);
                
                
                const minutosTrabalhados = differenceInMinutes(saida, entrada) - differenceInMinutes(almocoFim, almocoInicio);
                const minutosAlmoco = differenceInMinutes(almocoFim, almocoInicio);
                

                let minutosExtras = (entrada < horario_entrada_fixo) ? differenceInMinutes(horario_entrada_fixo, entrada): 0;
                let minutosAtraso = (entrada > horario_entrada_fixo) ? differenceInMinutes(entrada, horario_entrada_fixo): 0;


                if (minutosAlmoco > 120) {
                    minutosAtraso += (minutosAlmoco - 120);
                    console.log("minutosAtraso: ", minutosAtraso)
                }else {
                    // Verifica se o tempo de almoço foi menor que 120 minutos (2h)
                    minutosExtras += (120 - minutosAlmoco); // Tempo a mais trabalhado vira extra
                }  

                if(saida > horario_saida_fixo){
                    minutosExtras += ((differenceInMinutes(saida,horario_saida_fixo)) - minutosAtraso)
                }

                await knex("horas_trabalhadas").insert({
                    id_usuario,
                    data: /*knex.fn.now()*/hoje,
                    minutos_totais: minutosTrabalhados,
                    minutos_extras: minutosExtras
                });
                

                if (minutosAtraso > 0) {
                    // let atrasoCompensado = false;
                    // let faltaCompensar = minutosAtraso;
                    let atrasoCompensado = minutosExtras >= minutosAtraso;
                    let faltaCompensar = atrasoCompensado ? 0 : minutosAtraso - minutosExtras;
                
                    await knex("atrasos").insert({
                        id_usuario,
                        data: hoje,
                        minutos_atraso: minutosAtraso,
                        atraso_compensado: atrasoCompensado,
                        falta_compensar: faltaCompensar
                    });
                }else{
                    await knex("atrasos").insert({
                        id_usuario,
                        data: hoje,
                        minutos_atraso: minutosAtraso,
                        atraso_compensado: true,
                        falta_compensar: 0
                    });
                }

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