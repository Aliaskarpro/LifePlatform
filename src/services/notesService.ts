import apiClient from './api';
import { Note, NoteForm } from '../types';
import { MOCK_NOTES } from '../utils/mockData';
import { storage } from '../utils/storage';

const isDemoMode = () => {
  const token = storage.getToken();
  return !token || token === 'mock-jwt-token-demo-mode';
};

let mockNotes = [...MOCK_NOTES];

export const notesService = {
  getNotes: async (params?: { search?: string; category?: string }): Promise<Note[]> => {
    if (isDemoMode()) {
      let data = [...mockNotes];
      if (params?.search) {
        const q = params.search.toLowerCase();
        data = data.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      }
      if (params?.category) {
        data = data.filter(n => n.category === params.category);
      }
      return data.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }
    try {
      const { data } = await apiClient.get('/api/notes', { params });
      return data;
    } catch {
      return mockNotes;
    }
  },

  createNote: async (form: NoteForm): Promise<Note> => {
    if (isDemoMode()) {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        userId: 'demo-user-1',
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockNotes.unshift(newNote);
      return newNote;
    }
    const { data } = await apiClient.post('/api/notes', form);
    return data;
  },

  updateNote: async (id: string, form: Partial<NoteForm>): Promise<Note> => {
    if (isDemoMode()) {
      const idx = mockNotes.findIndex(n => n.id === id);
      if (idx >= 0) {
        mockNotes[idx] = { ...mockNotes[idx], ...form, updatedAt: new Date().toISOString() };
        return mockNotes[idx];
      }
      throw new Error('Note not found');
    }
    const { data } = await apiClient.put(`/api/notes/${id}`, form);
    return data;
  },

  deleteNote: async (id: string): Promise<void> => {
    if (isDemoMode()) {
      mockNotes = mockNotes.filter(n => n.id !== id);
      return;
    }
    await apiClient.delete(`/api/notes/${id}`);
  },

  togglePin: async (id: string, isPinned: boolean): Promise<Note> => {
    if (isDemoMode()) {
      const idx = mockNotes.findIndex(n => n.id === id);
      if (idx >= 0) {
        mockNotes[idx] = { ...mockNotes[idx], isPinned, updatedAt: new Date().toISOString() };
        return mockNotes[idx];
      }
      throw new Error('Note not found');
    }
    const { data } = await apiClient.put(`/api/notes/${id}/pin`, { is_pinned: isPinned });
    return data;
  },
};
