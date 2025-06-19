import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Teachers from "@/components/Teachers";
import Students from "@/components/Students";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GlobalBackground from "@/components/GlobalBackground";

export default function Home() {
  return (
    <>
      <GlobalBackground />
      <Navbar />
      <main className="wrapper">
        <Header />
        <About />
      </main>
      <Gallery />
      <main className="wrapper">
        <Teachers />
        <Students />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
