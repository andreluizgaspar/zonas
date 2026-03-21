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
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={`App ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            {/* Navbar */}
            <header className="App-header">
                <div className="navbar-container">
                    <div className="navbar-left">
                        {user && (
                            <button className="btn-toggle-sidebar" onClick={toggleSidebar}>
                                {sidebarOpen ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M15 18H9V8h6m2-2H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-6-4h-2v-2h2v2zm0-4h-2V7h2v4z" />
                                    </svg>
                                )}
                            </button>
                        )}
                        <div className="navbar-brand">
                            <h1>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Zonas <span>Urbana</span>
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
                        <Historico usuario={user} />
                    </aside>

                    {/* Área do Chat */}
                    <main className="main-content">
                        <Chat usuario={user} />
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