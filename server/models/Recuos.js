import mongoose from 'mongoose';

const recuosSchema = mongoose.Schema({
    frontal: { type: Number },
    lateral: { type: Number },
    fundos: { type: Number },
    entreBloco: { type: Number },
});

recuosSchema.methods.calcularAreaLivre = function (areaTerreno, largura, profundidade) {
    // Calcula a área de recuos baseado nos limites
    // Assume que o terreno é retangular
    if (!areaTerreno || !largura || !profundidade) {
        return 0;
    }

    // Área ocupada pelos recuos
    const areaRecuoFrontal = (this.frontal || 0) * largura;
    const areaRecuoFundos = (this.fundos || 0) * largura;
    const areaRecuoLateral = (this.lateral || 0) * profundidade * 2; // ambos os lados

    // Redução de área útil por recuos
    const totalRecuos = areaRecuoFrontal + areaRecuoFundos + areaRecuoLateral;

    return Math.max(0, areaTerreno - totalRecuos);
};

recuosSchema.methods.validarRecuos = function () {
    // Validar se os recuos estão dentro de valores razoáveis
    const maxRecuo = 50; // metros
    const minRecuo = 0;

    const recuos = [
        { nome: 'frontal', valor: this.frontal },
        { nome: 'lateral', valor: this.lateral },
        { nome: 'fundos', valor: this.fundos },
        { nome: 'entreBloco', valor: this.entreBloco },
    ];

    for (const recuo of recuos) {
        if (recuo.valor !== undefined && recuo.valor !== null) {
            if (recuo.valor < minRecuo || recuo.valor > maxRecuo) {
                return {
                    valido: false,
                    erro: `Recuo ${recuo.nome} deve estar entre ${minRecuo}m e ${maxRecuo}m, recebido: ${recuo.valor}m`,
                };
            }
        }
    }

    return { valido: true, erro: null };
};

export default recuosSchema;
