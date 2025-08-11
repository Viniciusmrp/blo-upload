"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SettingsPage = () => {
  const { currentUser, userData, updateUserData } = useAuth();
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const db = getFirestore();

  useEffect(() => {
    if (userData) {
      setHeight(userData.height || '');
      setWeight(userData.weight || '');
    }
  }, [userData]);

  useEffect(() => {
    const fetchWeightHistory = async () => {
      if (currentUser) {
        const q = query(collection(db, 'users', currentUser.uid, 'weightHistory'), orderBy('timestamp'));
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            timestamp: data.timestamp.toDate().toLocaleDateString(),
          };
        });
        setWeightHistory(history);
      }
    };
    fetchWeightHistory();
  }, [currentUser, db]);

  const handleSave = async () => {
    if (currentUser) {
      const newWeight = Number(weight);
      const newHeight = Number(height);
      
      const updatedData = {
        height: newHeight,
        weight: newWeight,
      };

      await updateUserData(updatedData);

      if (newWeight && newWeight !== userData?.weight) {
        await addDoc(collection(db, 'users', currentUser.uid, 'weightHistory'), {
          weight: newWeight,
          timestamp: serverTimestamp(),
        });
        const q = query(collection(db, 'users', currentUser.uid, 'weightHistory'), orderBy('timestamp'));
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            timestamp: data.timestamp.toDate().toLocaleDateString(),
          };
        });
        setWeightHistory(history);
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Settings</h1>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="height" className="text-sm text-gray-400">Height (cm)</label>
              <input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="weight" className="text-sm text-gray-400">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg border border-gray-600 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 rounded-lg py-2 px-4 text-white font-medium transition-colors"
            >
              Save Changes
            </button>
            {message && <p className="text-green-400 mt-4">{message}</p>}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Weight Progression</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;