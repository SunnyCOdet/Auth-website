import React, { useState } from 'react';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [secretKey, setSecretKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('');
    setSecretKey(null);

    if (password.length < 8) {
        setMessage('Password must be at least 8 characters long.');
        setMessageType('error');
        setIsLoading(false);
        return;
    }


    try {
      const response = await fetch('/api/register', { // Use relative path for proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful!');
        setMessageType('success');
        setSecretKey(data.secretKey); // Store the received secret key
        setUsername(''); // Clear form on success
        setPassword('');
      } else {
        setMessage(data.message || 'Registration failed.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration fetch error:', error);
      setMessage('An error occurred during registration. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {secretKey && messageType === 'success' && (
        <div className="secret-key-display">
           <strong>IMPORTANT: Save this key securely! You will NOT see it again.</strong>
           Your Secret Key: <code>{secretKey}</code>
           <p>Use this key along with your username in the application.</p>
        </div>
      )}
    </div>
  );
}

export default RegisterForm;
