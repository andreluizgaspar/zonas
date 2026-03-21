import React from 'react';
import '../styles/ResultadoZoneamento.css';

const ResultadoZoneamento = ({ resultado, coordenadas, endereco, onSalvar }) => {
    if (!resultado) {
        return null;
    }

    const {
        zona,
        categoria,
        hierarquia,
        caracteristicas,
        acessoLei,
        recuos,
        parametrosUrbanisticos,
    } = resultado;

    // Gerar nome do arquivo PDF baseado na zona
    const getPdfFileName = (zoneName) => {
        if (!zoneName) return null;
        // ZC1 -> zc_1, ZR2 -> zr_2, ZI3 -> zi_3
        const formatted = zoneName.toLowerCase().replace(/([a-z])(\d)/, '$1_$2');
        return `${formatted}.pdf`;
    };

    const pdfFileName = getPdfFileName(zona);
    const pdfUrl = pdfFileName ? `/docs/${pdfFileName}` : null;

    const handleSalvar = () => {
        if (onSalvar) {
            onSalvar({
                endereco,
                coordenadas,
                resultado,
                timestamp: new Date(),
            });
        }
    };

    return (
        <div className="resultado-container">
            <div className="resultado-header">
                <h2>Resultado do Zoneamento</h2>
                <button className="btn-salvar" onClick={handleSalvar}>
                    💾 Salvar Consulta
                </button>
            </div>

            <div className="resultado-content">
                {/* Informações Básicas */}
                <section className="secao">
                    <h3>📍 Localização</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Endereço:</span>
                            <span className="valor">{endereco}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Latitude:</span>
                            <span className="valor">{coordenadas.latitude.toFixed(6)}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Longitude:</span>
                            <span className="valor">{coordenadas.longitude.toFixed(6)}</span>
                        </div>
                    </div>
                </section>

                {/* Zona e Categoria */}
                <section className="secao destaque">
                    <div className="zona-display">
                        <div className="zona-badge">{zona}</div>
                        <div className="zona-info">
                            <h4>Zona de Zoneamento</h4>
                            <p>Categoria: <strong>{categoria}</strong></p>
                            <p>Hierarquia: <strong>{hierarquia}</strong></p>
                            {pdfUrl && (
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-documento"
                                    title="Ver documentação da zona em PDF"
                                >
                                    📄 Ver Documentação
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* Recuos */}
                {recuos && (
                    <section className="secao">
                        <h3>📏 Recuos (em metros)</h3>
                        <div className="recuos-grid">
                            {recuos.frontal !== undefined && (
                                <div className="recuo-card">
                                    <span className="recuo-label">Frontal</span>
                                    <span className="recuo-valor">{recuos.frontal}m</span>
                                </div>
                            )}
                            {recuos.lateral !== undefined && (
                                <div className="recuo-card">
                                    <span className="recuo-label">Lateral</span>
                                    <span className="recuo-valor">{recuos.lateral}m</span>
                                </div>
                            )}
                            {recuos.fundos !== undefined && (
                                <div className="recuo-card">
                                    <span className="recuo-label">Fundos</span>
                                    <span className="recuo-valor">{recuos.fundos}m</span>
                                </div>
                            )}
                            {recuos.entreBloco !== undefined && (
                                <div className="recuo-card">
                                    <span className="recuo-label">Entre Blocos</span>
                                    <span className="recuo-valor">{recuos.entreBloco}m</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Parâmetros Urbanísticos */}
                {parametrosUrbanisticos && (
                    <section className="secao">
                        <h3>🏢 Parâmetros Urbanísticos</h3>
                        <div className="parametros-grid">
                            {parametrosUrbanisticos.coeficienteAproveitamento !== undefined && (
                                <div className="parametro-card">
                                    <span className="parametro-label">Coef. Aproveitamento</span>
                                    <span className="parametro-valor">
                                        {parametrosUrbanisticos.coeficienteAproveitamento}x
                                    </span>
                                </div>
                            )}
                            {parametrosUrbanisticos.taxaOcupacao !== undefined && (
                                <div className="parametro-card">
                                    <span className="parametro-label">Taxa Ocupação</span>
                                    <span className="parametro-valor">
                                        {parametrosUrbanisticos.taxaOcupacao}%
                                    </span>
                                </div>
                            )}
                            {parametrosUrbanisticos.alturaMaxima !== undefined && (
                                <div className="parametro-card">
                                    <span className="parametro-label">Altura Máxima</span>
                                    <span className="parametro-valor">
                                        {parametrosUrbanisticos.alturaMaxima}m
                                    </span>
                                </div>
                            )}
                            {parametrosUrbanisticos.vagas !== undefined && (
                                <div className="parametro-card">
                                    <span className="parametro-label">Vagas Mínimas</span>
                                    <span className="parametro-valor">
                                        {parametrosUrbanisticos.vagas}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Características */}
                {caracteristicas && (
                    <section className="secao">
                        <h3>📋 Características</h3>
                        <div className="caracteristicas-text">
                            {caracteristicas}
                        </div>
                    </section>
                )}

                {/* Acesso à Lei */}
                {acessoLei && (
                    <section className="secao info-box">
                        <h3>⚖️ Acesso à Lei</h3>
                        <div className="lei-text">
                            {acessoLei}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ResultadoZoneamento;
