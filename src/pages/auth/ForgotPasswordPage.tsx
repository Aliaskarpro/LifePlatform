import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      if (authService.forgotPassword) {
        await authService.forgotPassword(email);
      } else {
        // Mock success
        await new Promise(res => setTimeout(res, 1000));
      }
      setStatus('success');
      setMessage('If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Reset password</h2>
        <p className="mt-2 text-sm text-slate-400">Enter your email to receive a reset link</p>
      </div>
      {status === 'success' && <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500 border border-green-500/20">{message}</div>}
      {status === 'error' && <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{message}</div>}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={status === 'success'} />
        <Button type="submit" className="w-full" isLoading={status === 'loading'} disabled={status === 'success'}>Send reset link</Button>
      </form>
      <p className="text-center text-sm text-slate-400">
        Remember your password? <Link to="/login" className="font-medium text-indigo-500 hover:text-indigo-400">Sign in</Link>
      </p>
    </div>
  );
};
