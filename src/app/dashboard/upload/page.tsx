// src/app/dashboard/upload/page.tsx
import NewUpload from '@/components/NewUpload';

export const dynamic = 'force-dynamic';

export default function UploadPage() {
  // No AppLayout wrapper needed here anymore
  return (
    <NewUpload />
  );
}