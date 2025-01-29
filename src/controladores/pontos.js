const knex = require("../conexaoBD");
const { ajustarFusoHorario, validarEntrada } = require("../utils/pontoUtils");

const registrarPonto = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;
        const { tipo, localizacao } = req.body;

        // Validar entrada do ponto
        const erroValidacao = validarEntrada(tipo, localizacao);
        if (erroValidacao) {
            return res.status(400).json({ mensagem: erroValidacao });
        }

        // Obter a data de hoje formatada
        const hoje = new Date().toISOString().split("T")[0];

        // Verificar se já existe um ponto do mesmo tipo para o mesmo usuário no mesmo dia
        const pontoExistente = await knex("pontos")
            .where({ id_usuario, tipo })
            .andWhereRaw("DATE(data_hora) = ?", [hoje])
            .first();

        if (pontoExistente) {
            return res.status(400).json({ mensagem: `Ponto de ${tipo} já registrado para hoje.` });
        }

        // Inserir o novo ponto com fuso horário ajustado
        const dataHoraAjustada = ajustarFusoHorario(new Date().toISOString());

        const [novoPonto] = await knex("pontos")
            .insert({
                id_usuario,
                tipo,
                data_hora: dataHoraAjustada,
                localizacao
            })
            .returning("*");

        // Registrar no LOG
        await knex("logs").insert({
            id_usuario,
            acao: "Registro de ponto",
            detalhes: `Usuário bateu ponto de ${tipo} em ${localizacao}`,
            data_hora: dataHoraAjustada
        });

        // Se for um ponto de saída, calcular horas trabalhadas e horas extras
        if (tipo === "saída") {
            const pontosDoDia = await knex("pontos")
                .where({ id_usuario })
                .andWhereRaw("DATE(data_hora) = CURRENT_DATE")
                .orderBy("data_hora", "asc");

            if (pontosDoDia.length >= 4) {
                const entrada = new Date(ajustarFusoHorario(pontosDoDia[0].data_hora));
                const almocoInicio = new Date(ajustarFusoHorario(pontosDoDia[1].data_hora));
                const almocoFim = new Date(ajustarFusoHorario(pontosDoDia[2].data_hora));
                const saida = new Date(ajustarFusoHorario(pontosDoDia[3].data_hora));

                const tempoTrabalhadoAntesDoAlmoco = (almocoInicio - entrada) / 3600000; // Horas antes do almoço
                const tempoTrabalhadoDepoisDoAlmoco = (saida - almocoFim) / 3600000; // Horas depois do almoço
                const tempoAlmoco = (almocoFim - almocoInicio) / 3600000; // Tempo de almoço

                let horasTrabalhadas = tempoTrabalhadoAntesDoAlmoco + tempoTrabalhadoDepoisDoAlmoco;
                let horasExtras = 0;
                let minutosAtraso = 0;

                // Verifica se o tempo de almoço foi menor que 2 horas
                if (tempoAlmoco < 2) {
                    horasExtras += (2 - tempoAlmoco); // Tempo a mais trabalhado vira extra
                }

                // Se o usuário saiu depois do horário, adiciona às horas extras
                if (horasTrabalhadas > 8) {
                    horasExtras += (horasTrabalhadas - 8);
                    horasTrabalhadas = 8; // Mantém o padrão de 8h diárias
                }

                // Se houver atraso na entrada ou almoço
                if (entrada > pontosDoDia[0].data_hora) {
                    minutosAtraso += (entrada - pontosDoDia[0].data_hora) / 60000;
                }
                if (tempoAlmoco > 2) {
                    minutosAtraso += (tempoAlmoco - 2) * 60;
                }

                await knex("horas_trabalhadas").insert({
                    id_usuario,
                    data: knex.fn.now(),
                    horas_totais: horasTrabalhadas.toFixed(2),
                    horas_extras: horasExtras.toFixed(2)
                });

                if (minutosAtraso > 0) {
                    await knex("atrasos").insert({
                        id_usuario,
                        data: knex.fn.now(),
                        minutos_atraso: minutosAtraso
                    });
                }
            }
        }

        return res.status(201).json({ mensagem: "Ponto registrado com sucesso!", ponto: novoPonto });
    } catch (error) {
        console.error("Erro ao registrar ponto:", error);
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
};

module.exports = {
    registrarPonto
}