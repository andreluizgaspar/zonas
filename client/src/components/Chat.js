import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import ResultadoZoneamento from './ResultadoZoneamento';
import MapaZona from './MapaZona';
import Historico from './Historico';
import '../styles/Chat.css';

// SVG Icons
const IconSend = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
);

const IconLoading = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconAlert = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="19" r="1" />
        <path d="M12 2L2 20h20L12 2z" />
    </svg>
);

const Chat = ({ usuario, showHistorico = false, consultaVisualizada = null }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [ultimoResultado, setUltimoResultado] = useState(null);
    const [ultimasCoordenadas, setUltimasCoordenadas] = useState(null);

    // Restaurar consulta quando o usuário clica "Ver" no histórico
    useEffect(() => {
        if (consultaVisualizada) {
            setUltimoResultado(consultaVisualizada.resultado);
            setUltimasCoordenadas(consultaVisualizada.coordenadas);
            
            // Adicionar mensagem do bot restaurando a consulta
            const botMessage = {
                text: consultaVisualizada.resultado?.resumo || `Consultando: ${consultaVisualizada.endereco}`,
                sender: 'bot',
                type: 'success'
            };
            setMessages([{ text: consultaVisualizada.endereco, sender: 'user' }, botMessage]);
        }
    }, [consultaVisualizada]);

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
                text: data.resumo || `Consulta processada! Zona: ${data.zone || 'N/A'}`,
                sender: 'bot',
                type: 'success'
            };
            setMessages([...newMessages, botMessage]);
        } catch (error) {
            const errorMsg =
                error.response?.data?.error ||
                'Não foi possível processar a consulta. Verifique o endereço.';
            const errorMessage = {
                text: errorMsg,
                sender: 'bot',
                type: 'error'
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
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <h3>Bem-vindo ao Consultor de Zoneamento</h3>
                            <p>Digite um endereço para consultar a regulamentação urbanística.</p>
                            <p className="example">Exemplo: "Avenida Brasil, 1000"</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`message message-${msg.sender} ${msg.type ? `message-${msg.type}` : ''}`}>
                                <div className="message-icon">
                                    {msg.sender === 'user' ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    ) : msg.type === 'error' ? (
                                        <IconAlert />
                                    ) : (
                                        <IconCheck />
                                    )}
                                </div>
                                <div className="message-content">
                                    {msg.sender === 'user' ? (
                                        msg.text
                                    ) : (
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown-content">
                                            {msg.text}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {carregando && (
                        <div className="loading-indicator">
                            <div className="loading-icon">
                                <IconLoading />
                            </div>
                            <span>Processando endereço...</span>
                        </div>
                    )}
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Digite um endereço de Londrina..."
                        disabled={carregando}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={carregando}
                        className="send-button"
                        title={carregando ? 'Processando...' : 'Enviar consulta'}
                    >
                        {carregando ? <IconLoading /> : <IconSend />}
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
                                    alert('Consulta armazenada no histórico!');
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
