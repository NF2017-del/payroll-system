import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-600 to-primary-400">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">PayrollHR</h1>
          <p className="text-slate-500">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center mb-3">Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded">
              <span className="font-medium">Admin:</span> admin / admin123
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="font-medium">HR:</span> hr / hr123
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="font-medium">Manager:</span> manager / manager123
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="font-medium">Employee:</span> employee / employee123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;