import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Contact } from '@/lib/types';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export function useContacts(page: number = 1, limit: number = 10) {
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page, limit, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/contacts?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.contacts);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err));
      console.error('[useContacts] Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, isAuthenticated]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (name: string, phone: string) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create contact');
    }

    const newContact = await response.json();
    setContacts((prev) => [newContact, ...prev].slice(0, limit));
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    return newContact;
  };

  const updateContact = async (id: string, name: string, phone: string) => {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update contact');
    }

    const updatedContact = await response.json();
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? updatedContact : c))
    );
    return updatedContact;
  };

  const deleteContact = async (id: string) => {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete contact');
    }

    setContacts((prev) => prev.filter((c) => c.id !== id));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    return { success: true };
  };

  return {
    contacts,
    pagination,
    isLoading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
