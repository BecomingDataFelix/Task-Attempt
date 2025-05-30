import { useState } from 'react';
import { signIn, fetchAuthSession } from 'aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';

// Import the CSS Module
import styles from './Login.module.css';

interface Props {
  setToken: (token: string) => void;
  setRole: (role: string) => void;
}

function Login({ setToken, setRole }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signIn({ username: email, password });
      const session = await fetchAuthSession(); 

      const token = session.tokens?.idToken?.toString(); 
      setToken(token || ''); 

      if (token) {
        const payload: any = jwtDecode(token);
        const role = payload['custom:role'] || 'member';
        setRole(role);

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/member');
        }
      } else {
        setRole('member');
        navigate('/member');
      }

    } catch (err) {
      console.error('Auth Error:', err);
      alert((err as Error).message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (showSignup) return <Signup onSuccess={() => setShowSignup(false)} />;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back!</h2>
        <p className={styles.subtitle}>Sign in to your account</p>

        <div className={styles.inputGroup}>
          <input 
            className={styles.input} 
            placeholder="Email Address" 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)} 
            disabled={loading}
          />
        </div>
        <div className={styles.inputGroup}>
          <input 
            className={styles.input} 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
            disabled={loading}
          />
        </div>

        <button 
          className={styles.button} 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Login'
          )}
        </button>

        <p className={styles.signupText}>
          Don't have an account? {' '}
          <button 
            className={styles.signupButton} 
            onClick={() => setShowSignup(true)}
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
