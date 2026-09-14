import api from './api';

import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

interface AuthRequest {
  email: string;
  password: string;
}

interface UpdateUserRequest {
  username: string;
}

interface SessionResponse {
  success: boolean;
}

export async function fetchNotes({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      search,
      tag,
    },
  });

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);

  return response.data;
}

export async function createNote(data: CreateNoteParams): Promise<Note> {
  const response = await api.post<Note>('/notes', data);

  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);

  return response.data;
}

export async function register(data: AuthRequest): Promise<User> {
  const response = await api.post<User>('/auth/register', data);

  return response.data;
}

export async function login(data: AuthRequest): Promise<User> {
  const response = await api.post<User>('/auth/login', data);

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function checkSession(): Promise<boolean> {
  const response = await api.get<SessionResponse>('/auth/session');

  return response.data.success;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>('/users/me');

  return response.data;
}

export async function updateMe(data: UpdateUserRequest): Promise<User> {
  const response = await api.patch<User>('/users/me', data);

  return response.data;
}
