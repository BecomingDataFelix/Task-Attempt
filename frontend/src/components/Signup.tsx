import { useState } from 'react';
import { signUp } from 'aws-amplify/auth'; // Updated import

interface Props {
  onSuccess: () => void;
}

function Signup({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');

  const handleSignup = async () => {
    try {
      // Direct call to the imported signUp function
      await signUp({
        username: email, // This is often used for the Cognito username, usually the email
        password,
        options: { // Attributes are now nested under 'options'
          userAttributes: {
            email,
            'custom:role': role,
          },
        },
      });
      alert('Signup successful. Please verify your email before logging in.');
      onSuccess();
    } catch (err) {
      console.error('Signup Error:', err); // Log the full error for debugging
      alert((err as Error).message || 'An unexpected error occurred during signup.');
    }
  };

  return (
    <div className="p-4">
      <input className="border p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 ml-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <select className="border p-2 ml-2" onChange={e => setRole(e.target.value)}>
        <option value="member">Team Member</option>
        <option value="admin">Admin</option>
      </select>
      <button className="bg-green-500 text-white p-2 ml-2" onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default Signup;