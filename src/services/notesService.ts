import apiClient from './api';
import { Note, NoteForm } from '../types';

export const notesService = {
  getNotes: async (params?: { search?: string; category?: string }): Promise<Note[]> =>
    (await apiClient.get('/api/notes', { params })).data,
  createNote: async (form: NoteForm): Promise<Note> => (await apiClient.post('/api/notes', form)).data,
  updateNote: async (id: string, form: Partial<NoteForm>): Promise<Note> =>
    (await apiClient.put(`/api/notes/${id}`, form)).data,
  deleteNote: async (id: string): Promise<void> => { await apiClient.delete(`/api/notes/${id}`); },
  togglePin: async (id: string, isPinned: boolean): Promise<Note> =>
    (await apiClient.put(`/api/notes/${id}/pin`, { is_pinned: isPinned })).data,
};
