'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/molecules/modal';
import { Input } from '@/components/ui/atoms/input';
import { Button } from '@/components/ui/atoms/button';
import { Contact } from '@/lib/types';
import { ContactSchema, ContactFormData, validatePhoneUniqueness } from '@/lib/schemas/contact.schema';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, phone: string) => Promise<void>;
  initialData?: Contact;
  title: string;
  existingContacts?: Contact[];
}

export function ContactModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title,
  existingContacts = []
}: ContactModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        phone: initialData?.phone || ''
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: ContactFormData) => {
    // Check for phone uniqueness in edit mode
    if (initialData && !validatePhoneUniqueness(data.phone, existingContacts, initialData.id)) {
      setError('phone', {
        type: 'manual',
        message: 'This phone number is already in use'
      });
      return;
    }

    try {
      await onSave(data.name, data.phone);
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong';
      setError('phone', { type: 'manual', message: errorMessage });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name *
          </label>
          <Input
            id="contact-name"
            placeholder="e.g. John Doe"
            {...register('name')}
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-phone" className="text-sm font-medium">
            Phone Number * <span className="text-xs text-muted-foreground">(digits only)</span>
          </label>
          <Input
            id="contact-phone"
            placeholder="e.g. +55 11 99999-9999"
            {...register('phone')}
            disabled={isSubmitting}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function CreateContactModal({
  isOpen,
  onClose,
  onSave,
  existingContacts = []
}: Pick<ContactModalProps, 'isOpen' | 'onClose' | 'onSave' | 'existingContacts'>) {
  return (
    <ContactModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      existingContacts={existingContacts}
      title="Add New Contact"
    />
  );
}

export function EditContactModal({
  isOpen,
  onClose,
  onSave,
  contact,
  existingContacts = []
}: Pick<ContactModalProps, 'isOpen' | 'onClose' | 'onSave' | 'existingContacts'> & { contact: Contact | null }) {
  return (
    <ContactModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={contact || undefined}
      existingContacts={existingContacts}
      title="Edit Contact"
    />
  );
}
