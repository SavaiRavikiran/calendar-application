import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Event } from '../../types/calendar';
import { GraphService } from '../../services/GraphService';
import { useCalendarStore } from '../../store/calendarStore';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  graphService: GraphService | null;
}

export default function EventModal({ isOpen, onClose, selectedDate, graphService }: EventModalProps) {
  const { addEvent, updateEvent, deleteEvent } = useCalendarStore();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState('');
  const [type, setType] = useState<Event['type']>('meeting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().slice(0, 16);
      setStartDate(formattedDate);
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endDateTime.getHours() + 1);
      setEndDate(endDateTime.toISOString().slice(0, 16));
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!graphService || !title || !startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      const eventData = {
        title,
        start: new Date(startDate),
        end: new Date(endDate),
        location,
        description,
        type,
        participants: participants.split(',').map(p => p.trim()).filter(Boolean)
      };

      if (selectedEvent) {
        const updatedEvent = await graphService.updateEvent({
          ...eventData,
          id: selectedEvent.id
        });
        updateEvent(updatedEvent);
      } else {
        const newEvent = await graphService.createEvent(eventData);
        addEvent(newEvent);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!graphService || !selectedEvent) return;

    setIsSubmitting(true);
    try {
      await graphService.deleteEvent(selectedEvent.id);
      deleteEvent(selectedEvent.id);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setDescription('');
    setParticipants('');
    setType('meeting');
    setSelectedEvent(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {selectedEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex items-center space-x-4">
            <Clock size={20} className="text-gray-500 dark:text-gray-400" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <MapPin size={20} className="text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Users size={20} className="text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Add participants (comma-separated emails)"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex items-center space-x-4">
            <div className="w-5 h-5 rounded-full bg-blue-500" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Event['type'])}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t dark:border-gray-700">
          {selectedEvent && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
              disabled={isSubmitting}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}