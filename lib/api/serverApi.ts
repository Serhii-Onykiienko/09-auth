import { cookies } from 'next/headers';

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

interface SessionResponse {
  success: boolean;
}

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore.toString();
}

export async function fetchNotes({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const cookieHeader = await getCookieHeader();

  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      search,
      tag,
    },
    headers: {
      Cookie: cookieHeader,
    },
  });

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const cookieHeader = await getCookieHeader();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return response.data;
}

export async function getMe(): Promise<User> {
  const cookieHeader = await getCookieHeader();

  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return response.data;
}

export async function checkSession(
  cookieHeader?: string
): Promise<boolean> {
  try {
    const currentCookieHeader = cookieHeader ?? (await getCookieHeader());

    const response = await api.get<SessionResponse>('/auth/session', {
      headers: {
        Cookie: currentCookieHeader,
      },
    });

    return response.data.success;
  } catch {
    return false;
  }
}
