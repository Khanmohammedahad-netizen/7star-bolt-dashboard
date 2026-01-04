import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { logAudit } from '../../utils/audit';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateEventWizard({ onClose, onCreated }: Props) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const createEvent = async () => {
    if (!user || !name || !client || !date) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        client,
        date,
        region: user.region,
        status: 'Pending'
      })
      .select()
      .single();

    if (!error && data) {
      await logAudit(
        'event_created',
        `Event "${name}" created`,
        user,
        data.id,
        user.region
      );
    }

    setLoading(false);
    onCreated();
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create New Event"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={createEvent} disabled={loading}>
            Create Event
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Event name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Client"
          value={client}
          onChange={e => setClient(e.target.value)}
        />

        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <div className="text-sm text-gray-500">
          Region automatically set to <b>{user?.region}</b>
        </div>
      </div>
    </Modal>
  );
}
