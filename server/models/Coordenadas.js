import mongoose from 'mongoose';

const coordenadasSchema = mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    wkid: { type: Number },
});

coordenadasSchema.methods.validar = function () {
    // Validar se as coordenadas estão dentro de valores válidos
    const latValida = this.latitude >= -90 && this.latitude <= 90;
    const lngValida = this.longitude >= -180 && this.longitude <= 180;

    if (!latValida) {
        return {
            valido: false,
            erro: `Latitude deve estar entre -90 e 90, recebida: ${this.latitude}`,
        };
    }

    if (!lngValida) {
        return {
            valido: false,
            erro: `Longitude deve estar entre -180 e 180, recebida: ${this.longitude}`,
        };
    }

    return { valido: true, erro: null };
};

coordenadasSchema.methods.converter = function (wkidOrigem = 4326, wkidDestino = 31982) {
    // Converter entre sistemas de coordenadas
    // WGS84 (4326) <-> SIRGAS 2000 UTM (31982)
    // Nota: Para conversão precisa, seria necessário usar biblioteca como proj4
    // Esta é uma aproximação simples para demonstração

    if (wkidOrigem === 4326 && wkidDestino === 31982) {
        // Conversão aproximada de WGS84 para SIRGAS2000 UTM Zona 22S (Londrina-PR)
        // Valores aproximados para Londrina, PR
        const xApprox = (this.longitude + 51) * 111320 + 500000; // Meridiano central
        const yApprox = (this.latitude - 10) * 110540;

        return {
            x: Math.round(xApprox),
            y: Math.round(yApprox),
            wkid: wkidDestino,
        };
    }

    if (wkidOrigem === 31982 && wkidDestino === 4326) {
        // Conversão inversa (aproximada)
        return {
            latitude: (this.latitude / 110540) + 10,
            longitude: (this.longitude - 500000) / 111320 - 51,
            wkid: wkidDestino,
        };
    }

    return {
        latitude: this.latitude,
        longitude: this.longitude,
        wkid: wkidOrigem,
    };
};

export default coordenadasSchema;
