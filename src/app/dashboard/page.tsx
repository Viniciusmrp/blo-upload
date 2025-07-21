// src/app/dashboard/page.tsx
import React from 'react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="text-gray-400">
        Upload a video to get started or view your past sessions.
      </p>
    </div>
  );
}