import { ContactsPage } from '@/components/contacts/ContactsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacts | Kanban App',
  description: 'Manage your WhatsApp contacts.',
};

export default function Page() {
  return <ContactsPage />;
}
