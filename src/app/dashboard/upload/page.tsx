// src/app/dashboard/upload/page.tsx
import AppLayout from '@/components/AppLayout';
import NewUpload from '@/components/NewUpload'; // Your existing NewUpload component
// import { Inter } from 'next/font/google'; // Only if not applied globally in layout.tsx

// const inter = Inter({ subsets: ['latin'] });
export const dynamic = 'force-dynamic';

export default function UploadPage() {
  return (
    // <div className={inter.className}> {/* Apply font if not globally in layout.tsx */}
    <AppLayout>
      <NewUpload />
    </AppLayout>
    // </div>
  );
}