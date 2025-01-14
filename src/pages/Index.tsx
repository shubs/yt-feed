import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 sm:pt-32">
        <Hero />
      </div>
    </div>
  );
};

export default Index;