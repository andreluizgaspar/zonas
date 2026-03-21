import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Historico.css';

const Historico = ({ usuario }) => {
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);

    const carregarHistorico = useCallback(async () => {
        if (!usuario) return;

        setCarregando(true);
        setErro(null);

        try {
            const { token } = usuario;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get('/api/query/history', config);
            setHistorico(data);
        } catch (error) {
            setErro('Erro ao carregar histórico. Tente novamente.');
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setCarregando(false);
        }
    }, [usuario]);

    useEffect(() => {
        carregarHistorico();
    }, [carregarHistorico]);

    const deletarConsulta = async (consultaId) => {
        try {
            const { token } = usuario;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.delete(`/api/query/${consultaId}`, config);
            setHistorico(historico.filter((h) => h._id !== consultaId));
        } catch (error) {
            setErro('Erro ao deletar consulta.');
            console.error('Erro ao deletar:', error);
        }
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleString('pt-BR');
    };

    if (carregando) {
        return <div className="historico-container loading">⏳ Carregando histórico...</div>;
    }

    return (
        <div className="historico-container">
            <div className="historico-header">
                <h2>📚 Histórico de Consultas</h2>
                <button className="btn-recarregar" onClick={carregarHistorico}>
                    🔄 Recarregar
                </button>
            </div>

            {erro && <div className="erro-message">{erro}</div>}

            {historico.length === 0 ? (
                <div className="vazio-message">
                    Nenhuma consulta realizada ainda.
                </div>
            ) : (
                <div className="historico-lista">
                    {historico.map((consulta) => (
                        <div key={consulta._id} className="historico-item">
                            <div className="historico-info">
                                <h4>{consulta.endereco}</h4>
                                <p className="zona-tag">Zona: <strong>{consulta.resultado?.zona || 'N/A'}</strong></p>
                                <p className="data-tag">{formatarData(consulta.createdAt)}</p>
                            </div>

                            <div className="historico-coordenadas">
                                <small>
                                    {consulta.coordenadas.latitude.toFixed(4)}, {consulta.coordenadas.longitude.toFixed(4)}
                                </small>
                            </div>

                            <div className="historico-actions">
                                <button className="btn-ver">👁️ Ver</button>
                                <button
                                    className="btn-deletar"
                                    onClick={() => deletarConsulta(consulta._id)}
                                >
                                    🗑️ Deletar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Historico;
