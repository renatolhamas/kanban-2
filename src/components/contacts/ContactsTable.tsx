'use client';

import React from 'react';
import { Contact } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

interface ContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactsTable({
  contacts,
  isLoading,
  onEdit,
  onDelete
}: ContactsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="p-12 text-center border rounded-lg bg-card">
        <p className="text-muted-foreground">No contacts found.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto shadow-sm border rounded-lg">
      <table className="w-full text-sm text-left text-text-primary">
        <thead className="text-xs uppercase bg-surface-container-low border-b">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">Name</th>
            <th scope="col" className="px-6 py-4 font-semibold">Phone</th>
            <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {contacts.map((contact) => (
            <tr key={contact.id} className="bg-surface hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4 font-medium whitespace-nowrap">{contact.name}</td>
              <td className="px-6 py-4">{contact.phone}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(contact)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-surface-container-low hover:text-primary transition-colors"
                  aria-label={`Edit ${contact.name}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(contact)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-surface-container-low hover:text-destructive transition-colors"
                  aria-label={`Delete ${contact.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContactsTable;
