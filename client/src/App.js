import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './components/Chat';
import Historico from './components/Historico';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [consultaVisualizada, setConsultaVisualizada] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            setUser(foundUser);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!email || !password) {
            setLoginError('Preencha email e senha');
            return;
        }

        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setEmail('');
            setPassword('');
            setConsultaVisualizada(null);
        } catch (error) {
            setLoginError('Email ou senha inválidos');
            console.error('Login error:', error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');

        if (!name || !email || !password) {
            setRegisterError('Preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            setRegisterError('Senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            const { data } = await axios.post('/api/users', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setName('');
            setEmail('');
            setPassword('');
            setConsultaVisualizada(null);
        } catch (error) {
            setRegisterError('Erro ao registrar. Email pode já estar em uso.');
            console.error('Register error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setName('');
        setEmail('');
        setPassword('');
        setConsultaVisualizada(null);
    };

    // Sessão expirada: se uma chamada autenticada (com Bearer token) voltar 401,
    // o token não é mais válido — força logout em vez de deixar a UI em estado inconsistente.
    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;
                const hadAuthHeader = !!error.config?.headers?.Authorization;
                if (status === 401 && hadAuthHeader) {
                    handleLogout();
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptorId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleVisualizarConsulta = (consulta) => {
        setConsultaVisualizada(consulta);
    };

    return (
        <div className={`App ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            {/* Navbar */}
            <header className="App-header">
                <div className="navbar-container">
                    <div className="navbar-left">
                        {user && (
                            <button
                                className="btn-toggle-sidebar"
                                onClick={toggleSidebar}
                                title={sidebarOpen ? 'Fechar histórico' : 'Abrir histórico'}
                                aria-label={sidebarOpen ? 'Fechar histórico' : 'Abrir histórico'}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <line x1="9.5" y1="4" x2="9.5" y2="20" />
                                    <rect
                                        x="4.5"
                                        y="5.5"
                                        width="4"
                                        height="13"
                                        rx="0.5"
                                        fill={sidebarOpen ? 'currentColor' : 'none'}
                                        stroke="none"
                                    />
                                </svg>
                            </button>
                        )}
                        <div className="navbar-brand">
                            <h1>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Zonas <span>Urbanas Londrina</span>
                            </h1>
                        </div>
                    </div>
                    {user && (
                        <div className="navbar-user">
                            <span className="user-name">Olá, {user.name.split(' ')[0]}</span>
                            <button className="btn-logout" onClick={handleLogout}>
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Conteúdo Principal */}
            {user ? (
                <div className="app-layout">
                    {/* Barra Lateral de Histórico */}
                    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                        <Historico usuario={user} onVisualizarConsulta={handleVisualizarConsulta} />
                    </aside>

                    {/* Área do Chat */}
                    <main className="main-content">
                        <Chat usuario={user} consultaVisualizada={consultaVisualizada} />
                    </main>
                </div>
            ) : isRegistering ? (
                <div className="auth-container">
                    <div className="auth-form-card">
                        <div className="auth-header">
                            <h2>Criar Conta</h2>
                            <p>Junte-se ao futuro do zoneamento urbano</p>
                        </div>
                        {registerError && <div className="error-message">{registerError}</div>}
                        <form onSubmit={handleRegister}>
                            <div className="input-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    placeholder="Seu nome completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Senha</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Começar Agora
                            </button>
                        </form>
                        <p className="auth-switch">
                            Já possui uma conta?{' '}
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => {
                                    setIsRegistering(false);
                                    setRegisterError('');
                                }}
                            >
                                Entrar
                            </button>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="auth-container">
                    <div className="auth-form-card">
                        <div className="auth-header">
                            <h2>Bem-vindo</h2>
                            <p>Acesse o painel de zoneamento inteligente</p>
                        </div>
                        {loginError && <div className="error-message">{loginError}</div>}
                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Senha</label>
                                <input
                                    type="password"
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Acessar Sistema
                            </button>
                        </form>
                        <p className="auth-switch">
                            Ainda não tem conta?{' '}
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => {
                                    setIsRegistering(true);
                                    setLoginError('');
                                }}
                            >
                                Criar conta gratuita
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;