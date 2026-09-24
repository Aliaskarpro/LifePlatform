import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) return setError('Passwords do not match');
    setIsLoading(true);
    try {
      await authService.register(formData.firstName, formData.lastName, formData.email, formData.password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
        <p className="mt-2 text-sm text-slate-400">Join EduPlatform today</p>
      </div>
      {error && <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <Input label="Last name" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
        <Input label="Email address" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <Input label="Password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        <Input label="Confirm password" type="password" required value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} />
        <Button type="submit" className="w-full" isLoading={isLoading}>Sign up</Button>
      </form>
      <p className="text-center text-sm text-slate-400">
        Already have an account? <Link to="/login" className="font-medium text-indigo-500 hover:text-indigo-400">Sign in</Link>
      </p>
    </div>
  );
};
