'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';

interface Session {
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
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div className="text-white p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Sessions Management</h1>

      {loading ? (
        <p>Loading sessions...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400">You have no saved sessions.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 capitalize mb-2">{session.exercise}</h2>
              <p className="text-sm text-gray-400 mb-4">{formatDate(session.uploadedAt)}</p>
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
