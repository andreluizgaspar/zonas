import mongoose from 'mongoose';

const parametrosUrbanisticosSchema = mongoose.Schema({
    coeficienteAproveitamento: { type: Number },
    taxaOcupacao: { type: Number },
    alturaMaxima: { type: Number },
    vagas: { type: Number },
});

parametrosUrbanisticosSchema.methods.calcularPotencialConstrutivo = function (areaTerreno) {
    // Calcula o potencial construtivo baseado no coeficiente de aproveitamento
    // Fórmula: Potencial = Coeficiente × Área do Terreno

    if (!areaTerreno || !this.coeficienteAproveitamento) {
        return 0;
    }

    return this.coeficienteAproveitamento * areaTerreno;
};

parametrosUrbanisticosSchema.methods.validarParametros = function () {
    // Validar se os parâmetros urbanísticos estão dentro de valores razoáveis
    const erros = [];

    if (this.coeficienteAproveitamento !== undefined && this.coeficienteAproveitamento !== null) {
        if (this.coeficienteAproveitamento < 0 || this.coeficienteAproveitamento > 10) {
            erros.push(
                `Coeficiente de Aproveitamento deve estar entre 0 e 10, recebido: ${this.coeficienteAproveitamento}`
            );
        }
    }

    if (this.taxaOcupacao !== undefined && this.taxaOcupacao !== null) {
        if (this.taxaOcupacao < 0 || this.taxaOcupacao > 100) {
            erros.push(
                `Taxa de Ocupação deve estar entre 0% e 100%, recebida: ${this.taxaOcupacao}%`
            );
        }
    }

    if (this.alturaMaxima !== undefined && this.alturaMaxima !== null) {
        if (this.alturaMaxima <= 0 || this.alturaMaxima > 200) {
            erros.push(
                `Altura Máxima deve estar entre 0 e 200 metros, recebida: ${this.alturaMaxima}m`
            );
        }
    }

    if (this.vagas !== undefined && this.vagas !== null) {
        if (this.vagas < 0) {
            erros.push(
                `Número de vagas deve ser positivo, recebido: ${this.vagas}`
            );
        }
    }

    return {
        valido: erros.length === 0,
        erros: erros,
    };
};

export default parametrosUrbanisticosSchema;
