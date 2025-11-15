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

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            setUser(foundUser);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            console.error('Invalid credentials');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/users', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            console.error('Could not register user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Zonas</h1>
                {user && <button onClick={handleLogout}>Logout</button>}
            </header>
            {user ? (
                <Chat />
            ) : isRegistering ? (
                <form onSubmit={handleRegister}>
                    <h2>Criar conta</h2>
                    <input
                        type="text"
                        placeholder="Nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Register</button>
                    <p>
                        <button type="button" onClick={() => setIsRegistering(false)}>
                            Login
                        </button>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                    <p>
                        <button type="button" onClick={() => setIsRegistering(true)}>
                            Criar uma conta
                        </button>
                    </p>
                </form>
            )}
        </div>
    );
}

export default App;