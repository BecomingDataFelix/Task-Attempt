import { useState } from 'react';
import { signIn, fetchAuthSession } from 'aws-amplify/auth';
import Signup from './Signup';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

interface Props {
  setToken: (token: string) => void;
  setRole: (role: string) => void;
}

function Login({ setToken, setRole }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async () => {
    try {
      await signIn({ username: email, password }); // user object not needed here directly
      const session = await fetchAuthSession(); 
      
      const token = session.tokens?.idToken?.toString(); 
      setToken(token || ''); 
      
      // Decode the JWT token string to get the payload
      if (token) {
        const payload: any = jwtDecode(token); // Use jwtDecode to get the payload
        setRole(payload['custom:role'] || 'member');
      } else {
        setRole('member'); // Default role if no token is found
      }

    } catch (err) {
      console.error('Auth Error:', err);
      alert('Authentication failed');
    }
  };

  if (showSignup) return <Signup onSuccess={() => setShowSignup(false)} />;

  return (
    <div className="p-4">
      <input className="border p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 ml-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 ml-2" onClick={handleSubmit}>Login</button>
      <p className="mt-2 text-sm">
        Don't have an account? <button className="text-blue-600 underline" onClick={() => setShowSignup(true)}>Sign up</button>
      </p>
    </div>
  );
}

export default Login;