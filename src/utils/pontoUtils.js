const { format, utcToZonedTime } = require("date-fns-tz");

// 📌 Função para formatar data no fuso correto (dd/mm/yyyy)
const formatarData = (dataISO) => {
    const fusoHorario = "America/Sao_Paulo";
    const dataZonada = utcToZonedTime(dataISO, fusoHorario);
    return format(dataZonada, "dd/MM/yyyy", { timeZone: fusoHorario });
};

// 📌 Função para ajustar fuso horário e manter padrão 24h
const ajustarFusoHorario = (dataISO) => {
    const fusoHorario = "America/Sao_Paulo";
    const dataZonada = utcToZonedTime(dataISO, fusoHorario);
    return format(dataZonada, "yyyy-MM-dd HH:mm:ss", { timeZone: fusoHorario });
};

// 📌 Função para agrupar pontos por data
const agruparPontosPorData = (pontos) => {
    return pontos.reduce((acc, ponto) => {
        const dataFormatada = formatarData(ponto.data_hora);

        if (!acc[dataFormatada]) {
            acc[dataFormatada] = {
                data_pontos_referencia: dataFormatada,
                pontos_referencia: []
            };
        }

        // Ajustando fuso horário da data/hora do ponto
        const pontoCorrigido = {
            ...ponto,
            data_hora: ajustarFusoHorario(ponto.data_hora)
        };

        acc[dataFormatada].pontos_referencia.push(pontoCorrigido);
        return acc;
    }, {});
};

// 📌 Função para ordenar pontos por tipo
const ordenarPontos = (pontosOrganizados) => {
    const ordemTipos = ["entrada", "almoço_inicio", "almoço_fim", "saída"];

    Object.keys(pontosOrganizados).forEach((data) => {
        pontosOrganizados[data].pontos_referencia.sort((a, b) => {
            return ordemTipos.indexOf(a.tipo) - ordemTipos.indexOf(b.tipo);
        });
    });

    return Object.values(pontosOrganizados);
};

const validarEntrada = (tipo, localizacao) => {
    const tiposValidos = ["entrada", "almoço_inicio", "almoço_fim", "saída"];
    const localizacoesValidas = ["Loja Matriz Nordeste", "Loja Vale"];

    if (!tiposValidos.includes(tipo)) {
        return "Tipo de ponto inválido.";
    }
    if (!localizacoesValidas.includes(localizacao)) {
        return "Localização inválida.";
    }
    return null; 
};

module.exports = {
    formatarData,
    ajustarFusoHorario,
    agruparPontosPorData,
    ordenarPontos,
    validarEntrada
};