// src/app/dashboard/sessions/page.tsx
'use client'; // This will be a client component to use hooks

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

// A type for our session data from Firestore
interface SessionDoc {
  id: string;
  exerciseName: string;
  timestamp: Timestamp;
  load: number;
  // Add other fields from your session document if they exist
}

const SessionsPage = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [dateFilter, setDateFilter] = useState('all');
  const [exerciseFilter, setExerciseFilter] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Based on your app structure, I'm assuming session data is in a subcollection
        // named 'sessions' under the user's document at `users/${currentUser.uid}/sessions`.
        const q = query(collection(db, 'users', currentUser.uid, 'sessions'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedSessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SessionDoc));
        setSessions(fetchedSessions);
        setFilteredSessions(fetchedSessions); // Initially, show all sessions
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [currentUser]);

  // Effect to apply filters when filter criteria change
  useEffect(() => {
    let tempSessions = [...sessions];

    // Date filtering
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      if (dateFilter === 'last_week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'last_month') {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === 'last_year') {
        filterDate.setFullYear(now.getFullYear() - 1);
      }
      tempSessions = tempSessions.filter(s => s.timestamp.toDate() >= filterDate);
    }

    // Exercise name filtering
    if (exerciseFilter.trim() !== '') {
      tempSessions = tempSessions.filter(s => 
        s.exerciseName.toLowerCase().includes(exerciseFilter.toLowerCase())
      );
    }

    setFilteredSessions(tempSessions);
  }, [dateFilter, exerciseFilter, sessions]);

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFilter(e.target.value);
  };

  const handleExerciseFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExerciseFilter(e.target.value);
  };
  
  const uniqueExercises = [...new Set(sessions.map(s => s.exerciseName))];

  return (
    <div className="text-white p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Sessions Management</h1>

      {/* Filter UI */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Date</label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={handleDateFilterChange}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="all">All Time</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
        <div>
          <label htmlFor="exercise-filter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Exercise</label>
          <input
            type="text"
            id="exercise-filter"
            list="exercise-suggestions"
            value={exerciseFilter}
            onChange={handleExerciseFilterChange}
            placeholder="e.g., Squat"
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          <datalist id="exercise-suggestions">
            {uniqueExercises.map(ex => <option key={ex} value={ex} />)}
          </datalist>
        </div>
      </div>

      {/* Content Display */}
      {loading ? (
        <p>Loading sessions...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : filteredSessions.length === 0 ? (
        <p className="text-gray-400">No sessions match the current filters or you have no sessions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 rounded-tl-lg">Exercise Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 rounded-tr-lg">Load (kg)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-white">{session.exerciseName}</td>
                  <td className="py-3 px-4 text-sm text-white">{session.timestamp.toDate().toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm text-white">{session.load}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
