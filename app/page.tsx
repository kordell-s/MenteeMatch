import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnerLogos from "@/components/PartnerLogos";
import Testimonials from "@/components/Testimonials";
import MentorCategories from "@/components/MentorCategories";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <PartnerLogos />
        <Testimonials />
        <MentorCategories />
      </main>
      <Footer />
    </div>
  );
}
