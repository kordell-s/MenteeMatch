import Navbar from "@/components/Navbar";
import MentorBrowser from "../../components/MentorBrowser";

export default function BrowsePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <MentorBrowser />
        </div>
      </main>
    </div>
  );
}
