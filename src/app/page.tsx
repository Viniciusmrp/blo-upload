import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-white mb-4">
        Welcome to ARGUS
      </h1>
      <p className="text-gray-400 text-xl">
        Your AI-powered exercise form analysis platform
      </p>
    </div>
  );
}