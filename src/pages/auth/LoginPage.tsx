import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    setEmail('demo@example.com');
    setPassword('Demo1234!');
    setTimeout(() => {
      authService.login('demo@example.com', 'Demo1234!')
        .then(data => { setAuth(data.user, data.token); navigate('/dashboard'); })
        .catch(() => setError('Demo login failed'));
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">Sign in to your account</p>
      </div>

      {error && <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}

      <form className="space-y-4" onSubmit={handleLogin}>
        <Input 
          label="Email address" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          icon={<Mail size={18}/>} 
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          icon={<Lock size={18}/>} 
        />
        
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-slate-300">
            <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-indigo-500 hover:text-indigo-400">Forgot password?</Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>Sign in</Button>
        <Button type="button" variant="secondary" className="w-full" onClick={handleDemo}>Demo Login</Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        Don't have an account? <Link to="/register" className="font-medium text-indigo-500 hover:text-indigo-400">Sign up</Link>
      </p>
    </div>
  );
};
