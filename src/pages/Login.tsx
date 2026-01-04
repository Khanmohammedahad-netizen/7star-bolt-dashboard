import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const { error } = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
        })
      : await supabase.auth.signInWithPassword({
          email,
          password,
        });

    if (error) {
      setError(error.message);
    } else if (isSignup) {
      setError('Account created! Please login.');
      setIsSignup(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4"
      >
        {/* COMPANY NAME */}
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
            7 Star International
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center mt-2">
          {isSignup ? 'Sign up for Dashboard' : 'Sign in to Dashboard'}
        </h1>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? (isSignup ? 'Signing up…' : 'Signing in…') : (isSignup ? 'Sign Up' : 'Login')}
        </button>

        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          className="w-full text-blue-600 py-2"
        >
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </form>
    </div>
  );
}
