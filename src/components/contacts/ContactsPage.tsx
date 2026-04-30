'use client';

import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { ContactsTable } from './ContactsTable';
import { CreateContactModal, EditContactModal } from './ContactModals';
import { DeleteConfirmation } from './DeleteConfirmation';
import { Contact } from '@/lib/types';
import { Button } from '@/components/ui/atoms/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

/**
 * ContactsPage Component
 * 
 * Main container for managing contacts.
 * Story 4.5: Contacts page CRUD
 */
export function ContactsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    contacts,
    pagination,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refetch
  } = useContacts(currentPage, itemsPerPage);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const handleCreate = async (name: string, phone: string) => {
    await createContact(name, phone);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      refetch();
    }
  };

  const handleUpdate = async (name: string, phone: string) => {
    if (editingContact) {
      await updateContact(editingContact.id, name, phone);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteContact(id);
    refetch();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp contacts directory.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus size={18} />}
        >
          Add Contact
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Error: {error.message}
        </div>
      )}

      <div className="space-y-4">
        <ContactsTable
          contacts={contacts}
          isLoading={isLoading}
          onEdit={setEditingContact}
          onDelete={setDeletingContact}
        />

        {/* Pagination */}
        {pagination.total > itemsPerPage && (
          <div className="flex items-center justify-between px-2 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> contacts
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * itemsPerPage >= pagination.total || isLoading}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateContactModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
        existingContacts={contacts}
      />

      <EditContactModal
        isOpen={!!editingContact}
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onSave={handleUpdate}
        existingContacts={contacts}
      />

      <DeleteConfirmation
        isOpen={!!deletingContact}
        contact={deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ContactsPage;
