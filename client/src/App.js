import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './components/Chat';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeTab, setActiveTab] = useState('consulta');
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');

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
        setActiveTab('consulta');
    };

    return (
        <div className="App">
            {/* Navbar */}
            <header className="App-header">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <h1>🗺️ Zonas - Consulta de Zoneamento</h1>
                    </div>
                    {user && (
                        <div className="navbar-user">
                            <span className="user-name">Olá, {user.name}!</span>
                            <button className="btn-logout" onClick={handleLogout}>
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Conteúdo Principal */}
            {user ? (
                <div className="app-container">
                    {/* Abas de Navegação */}
                    <nav className="app-nav">
                        <button
                            className={`nav-item ${activeTab === 'consulta' ? 'active' : ''}`}
                            onClick={() => setActiveTab('consulta')}
                        >
                            🔍 Nova Consulta
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'historico' ? 'active' : ''}`}
                            onClick={() => setActiveTab('historico')}
                        >
                            📚 Histórico
                        </button>
                    </nav>

                    {/* Conteúdo das Abas */}
                    <main className="app-content">
                        {activeTab === 'consulta' && <Chat usuario={user} />}
                        {activeTab === 'historico' && <Chat usuario={user} showHistorico={true} />}
                    </main>
                </div>
            ) : isRegistering ? (
                <div className="auth-container">
                    <div className="auth-form-card">
                        <h2>Criar Nova Conta</h2>
                        {registerError && <div className="error-message">{registerError}</div>}
                        <form onSubmit={handleRegister}>
                            <input
                                type="text"
                                placeholder="Seu nome completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Senha (mín. 6 caracteres)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">
                                Registrar
                            </button>
                        </form>
                        <p className="auth-switch">
                            Já tem conta?{' '}
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => {
                                    setIsRegistering(false);
                                    setRegisterError('');
                                }}
                            >
                                Faça login
                            </button>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="auth-container">
                    <div className="auth-form-card">
                        <h2>Entrar</h2>
                        {loginError && <div className="error-message">{loginError}</div>}
                        <form onSubmit={handleLogin}>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">
                                Entrar
                            </button>
                        </form>
                        <p className="auth-switch">
                            Não tem conta?{' '}
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => {
                                    setIsRegistering(true);
                                    setLoginError('');
                                }}
                            >
                                Registre-se agora
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;