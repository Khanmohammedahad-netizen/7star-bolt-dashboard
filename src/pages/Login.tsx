import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // If successful, the auth state change will handle navigation
      // But we can verify the session was created
      if (!data.session) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Don't set loading to false here - let the auth context handle it
      // The page will automatically redirect when user is set
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4"
      >
        {/* COMPANY NAME */}
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
            7 Star International
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center mt-2">
          Sign in to Dashboard
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
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
