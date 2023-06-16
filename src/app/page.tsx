/**To summarize, this code imports the "Image" component from Next.js for optimized image loading, imports the "Inter" font from a Google Fonts package, and imports the "NewUpload" component from a local file. It then defines a React component called "Home" that represents the main content of a web page. Within this component, it renders a <main> element with a specific layout and includes the "NewUpload" component for file uploading functionality. */

import Image from "next/image";
import { Inter } from "next/font/google";
import { NewUpload } from "@/components/NewUpload";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NewUpload />
    </main>
  );
}
