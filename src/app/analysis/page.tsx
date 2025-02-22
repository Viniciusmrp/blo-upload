import { Inter } from "next/font/google";
import NewUpload from "@/components/NewUpload";

const inter = Inter({ subsets: ["latin"] });

export default function AnalysisPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NewUpload />
    </main>
  );
}