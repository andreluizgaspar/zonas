import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Zonas</h1>
        {user && <button onClick={handleLogout}>Logout</button>}
      </header>
      {user ? (
        <Chat />
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
}

export default App;