'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/molecules/modal';
import { Button } from '@/components/ui/atoms/button';
import { Contact } from '@/lib/types';

interface DeleteConfirmationProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteConfirmation({
  isOpen,
  contact,
  onClose,
  onConfirm
}: DeleteConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!contact) return;

    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(contact.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Contact">
      <div className="space-y-4">
        <p className="text-sm text-text-primary">
          Are you sure you want to delete <strong>{contact?.name}</strong>? 
          This action cannot be undone.
        </p>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Contact'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmation;
