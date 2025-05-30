import { useState } from 'react';
import { signUp } from 'aws-amplify/auth';

// Import the CSS Module
import styles from './Signup.module.css'; // <--- IMPORTANT CHANGE

interface Props {
  onSuccess: () => void;
}

function Signup({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            'custom:role': role,
          },
        },
      });
      alert('Signup successful! Please check your email for a verification code before logging in.');
      onSuccess();
    } catch (err) {
      console.error('Signup Error:', err);
      alert((err as Error).message || 'An unexpected error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create an Account</h2>
        <p className={styles.subtitle}>Join us and manage your tasks!</p>

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
        <div className={styles.selectWrapper}> {/* Wrapper for select and custom arrow */}
          <select 
            className={styles.select} 
            value={role} 
            onChange={e => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="member">Team Member</option>
            <option value="admin">Admin</option>
          </select>
          {/* Custom arrow for select input */}
          <svg className={styles.selectArrow} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>

        <button 
          className={styles.button} 
          onClick={handleSignup} 
          disabled={loading}
        >
          {loading ? (
            <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Sign Up'
          )}
        </button>

        <p className={styles.loginText}>
          Already have an account? {' '}
          <button 
            className={styles.loginButton} 
            onClick={onSuccess}
            disabled={loading}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;