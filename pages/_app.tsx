import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { Analytics } from "@vercel/analytics/react"

function MyApp({ Component, pageProps }: AppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  useEffect(() => {
    // Check if the user is already authenticated
    const savedAuth = sessionStorage.getItem('authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    const correctPassword = 'alexdang19';
    if (inputPassword === correctPassword) {
      sessionStorage.setItem('authenticated', 'true'); // Save authentication state
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <Component {...pageProps} />
          <Analytics debug={true} />
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <h1>Enter Password to Access the Site</h1>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="alexdang19"
              style={{ padding: '8px', marginRight: '10px' }}
            />
            <button onClick={handleLogin} style={{ padding: '8px' }}>
              Submit
            </button>
          </div>
          <Analytics debug={true} />
        </>
      )}
    </>
  );
}

export default MyApp;
