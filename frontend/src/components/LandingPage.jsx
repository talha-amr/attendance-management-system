import LandingPageNavbar from "@/components/LandingPageNavbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#f8f9fc] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <LandingPageNavbar />
      <Hero />
      <About />
      <Footer />
    </main>
  );
}