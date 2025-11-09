import GoogleMapsAPI from './GoogleMapsAPI.js';

class ProcessadorEndereco {
  constructor() {
    this.mapsApi = new GoogleMapsAPI();
  }

  async converterEnderecoParaCoordenadas(endereco) {
    return this.mapsApi.geocode(endereco);
  }
}

export default ProcessadorEndereco;
