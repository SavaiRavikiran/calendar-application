import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Moon, Sun, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useCalendarStore } from '../../store/calendarStore';
import { GraphService } from '../../services/GraphService';
import { ViewType } from '../../types/calendar';
import EventModal from './EventModal';

export default function CalendarView() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [graphService, setGraphService] = useState<GraphService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dayGridMonth');
  
  const {
    events,
    darkMode,
    isLoading,
    setEvents,
    toggleDarkMode,
    setLoading,
    setError
  } = useCalendarStore();

  useEffect(() => {
    if (isAuthenticated && accounts[0]) {
      const service = new GraphService(instance, accounts[0]);
      setGraphService(service);
      
      service.startPolling((fetchedEvents) => {
        console.log('Fetched events:', fetchedEvents);
        setEvents(fetchedEvents);
      });

      return () => {
        service.stopPolling();
      };
    }
  }, [isAuthenticated, instance, accounts, setEvents]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleDateSelect = (selectInfo: any) => {
    if (!isAuthenticated) {
      alert('Please sign in to create events');
      return;
    }
    setSelectedDate(selectInfo.start);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    if (!isAuthenticated) {
      alert('Please sign in to edit events');
      return;
    }
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedDate(event.start);
      setIsModalOpen(true);
    }
  };

  const handleSignIn = async () => {
    try {
      await instance.loginPopup();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Unified Calendar
          </h1>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </motion.button>
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Plus size={20} />
                <span>New Event</span>
              </motion.button>
            )}
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-lg shadow-xl overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView={currentView}
            editable={isAuthenticated}
            selectable={isAuthenticated}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events.map(event => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              className: `event-${event.type}`,
              extendedProps: {
                location: event.location,
                description: event.description,
                participants: event.participants
              }
            }))}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventClassNames={darkMode ? 'dark-mode-event' : ''}
          />
        </motion.div>

        <AnimatePresence>
          {isModalOpen && (
            <EventModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              selectedDate={selectedDate}
              graphService={graphService}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}