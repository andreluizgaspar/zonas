import React, { useState } from 'react';
import axios from 'axios';
import ResultadoZoneamento from './ResultadoZoneamento';
import MapaZona from './MapaZona';
import Historico from './Historico';
import '../styles/Chat.css';

const Chat = ({ usuario, showHistorico = false }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [ultimoResultado, setUltimoResultado] = useState(null);
    const [ultimasCoordenadas, setUltimasCoordenadas] = useState(null);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');
        setCarregando(true);

        try {
            const user = usuario || JSON.parse(localStorage.getItem('user'));
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            const { token } = user;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.post('/api/query', { query: input }, config);

            // Salvar resultado e coordenadas
            setUltimoResultado(data);
            setUltimasCoordenadas(data.coordenadas);

            const botMessage = {
                text: `✅ Consulta processada com sucesso! Zona: ${data.zona || 'N/A'}`,
                sender: 'bot',
            };
            setMessages([...newMessages, botMessage]);
        } catch (error) {
            const errorMsg =
                error.response?.data?.error ||
                'Não foi possível processar a consulta. Verifique o endereço.';
            const errorMessage = {
                text: `❌ Erro: ${errorMsg}`,
                sender: 'bot',
            };
            setMessages([...newMessages, errorMessage]);
            console.error('Erro:', error);
        } finally {
            setCarregando(false);
        }
    };

    if (showHistorico) {
        return <Historico usuario={usuario} />;
    }

    return (
        <div className="chat-wrapper">
            {/* Chat Component */}
            <div className="chat-container">
                <div className="messages">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <h3>👋 Bem-vindo!</h3>
                            <p>Digite um endereço para consultar o zoneamento.</p>
                            <p className="example">Exemplo: "Avenida Brasil, 1000, Londrina"</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="message-content">{msg.text}</div>
                            </div>
                        ))
                    )}
                    {carregando && <div className="loading-indicator">⏳ Processando...</div>}
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Digite um endereço (ex: Avenida Brasil, 1000)..."
                        disabled={carregando}
                    />
                    <button onClick={sendMessage} disabled={carregando} className="send-button">
                        {carregando ? '⏳' : '📤'}
                    </button>
                </div>
            </div>

            {/* Resultado */}
            {ultimoResultado && ultimasCoordenadas && (
                <div className="resultado-section">
                    <div className="resultado-grid">
                        <div className="resultado-col">
                            <MapaZona
                                coordenadas={ultimasCoordenadas}
                                endereco={ultimoResultado.endereco || 'Localização consultada'}
                            />
                        </div>
                        <div className="resultado-col">
                            <ResultadoZoneamento
                                resultado={ultimoResultado.resultado || ultimoResultado}
                                coordenadas={ultimasCoordenadas}
                                endereco={ultimoResultado.endereco || 'Consulta realizada'}
                                onSalvar={() => {
                                    alert('✅ Consulta armazenada no histórico!');
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
