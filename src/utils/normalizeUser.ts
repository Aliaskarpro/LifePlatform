import { User } from '../types';

export const normalizeUser = (value: any): User => ({
  id: value.id,
  email: value.email,
  firstName: value.first_name ?? value.firstName ?? '',
  lastName: value.last_name ?? value.lastName ?? '',
  avatarUrl: value.avatar_url ?? value.avatarUrl ?? undefined,
  role: value.role === 'admin' ? 'admin' : 'user',
  subscriptionTier: value.subscription_tier ?? value.subscriptionTier ?? 'free',
  createdAt: value.created_at ?? value.createdAt ?? '',
});
