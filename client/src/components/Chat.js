import React, { useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');

    try {
      const { token } = JSON.parse(localStorage.getItem('user'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post('/api/query', { query: input }, config);
      const botMessage = { text: data.resumo || JSON.stringify(data, null, 2), sender: 'bot' };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      const errorMessage = { text: 'Error: Could not get a response from the server.', sender: 'bot' };
      setMessages([...newMessages, errorMessage]);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <pre>{msg.text}</pre>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Digite seu endereço..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default Chat;
