'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';
import { useRouter } from 'next/navigation';

interface Session {
  videoId: string; // Using videoId as the unique identifier
  videoName: string;
  exercise: string;
  uploadedAt: string;
  email: string;
  weight: number;
  height: number;
  load: number;
  isPortrait: boolean;
}

const SessionsPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filterMonth, setFilterMonth] = React.useState('');
  const [filterExercise, setFilterExercise] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('newest');

  React.useEffect(() => {
    const fetchSessions = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const fetchedSessions = await api.getUserVideos();
        if (fetchedSessions) {
          setSessions(fetchedSessions);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getMonthFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const uniqueMonths = React.useMemo(() => {
    const months = new Set(sessions.map(s => getMonthFromDate(s.uploadedAt)));
    return Array.from(months);
  }, [sessions]);

  const uniqueExercises = React.useMemo(() => {
    const exercises = new Set(sessions.map(s => s.exercise));
    return Array.from(exercises);
  }, [sessions]);

  const filteredAndSortedSessions = React.useMemo(() => {
    let result = [...sessions];

    if (filterMonth) {
      result = result.filter(s => getMonthFromDate(s.uploadedAt) === filterMonth);
    }

    if (filterExercise) {
      result = result.filter(s => s.exercise === filterExercise);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.uploadedAt).getTime();
      const dateB = new Date(b.uploadedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [sessions, filterMonth, filterExercise, sortOrder]);

  const handleVideoClick = (videoId: string) => {
    router.push(`/dashboard/sessions/${videoId}`);
  };

  return (
    <div className="text-white p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Sessions Management</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        {/* Filters */}
        <select onChange={(e) => setFilterMonth(e.target.value)} value={filterMonth} className="bg-gray-700 text-white rounded p-2">
          <option value="">All Months</option>
          {uniqueMonths.map(month => <option key={month} value={month}>{month}</option>)}
        </select>

        <select onChange={(e) => setFilterExercise(e.target.value)} value={filterExercise} className="bg-gray-700 text-white rounded p-2">
          <option value="">All Exercises</option>
          {uniqueExercises.map(exercise => <option key={exercise} value={exercise}>{exercise}</option>)}
        </select>

        {/* Sort */}
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="bg-gray-700 text-white rounded p-2">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <p>Loading sessions...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : filteredAndSortedSessions.length === 0 ? (
        <p className="text-gray-400">You have no saved sessions that match the filters.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredAndSortedSessions.map((session) => (
            <div key={session.videoId} className="bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-700" onClick={() => handleVideoClick(session.videoId)}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-300 capitalize mb-2">{session.exercise}</h2>
                <p className="text-sm text-gray-400 mb-4">{formatDate(session.uploadedAt)}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold">Load:</span> {session.load} kg</p>
                <p><span className="font-semibold">Weight:</span> {session.weight} kg</p>
                <p className="text-sm text-gray-500 truncate"><span className="font-semibold">File:</span> {session.videoName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;