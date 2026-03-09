import { MapPin, Calendar, Lightbulb } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { CONFERENCE } from "@/data/mockData";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="bg-hero text-primary-foreground py-24 sm:py-32 px-4">
        <div className="container mx-auto text-center max-w-4xl animate-fade-up">
          <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-4">
            June 15 – 17, 2026
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {CONFERENCE.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80 mb-10">
            <MapPin className="h-5 w-5" />
            <span>{CONFERENCE.location}</span>
          </div>
          <div className="flex justify-center mb-10">
            <CountdownTimer targetDate={CONFERENCE.date} />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/submit"
              className="bg-gold text-secondary-foreground px-6 py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
            >
              Submit Your Paper
            </Link>
            <Link
              to="/program"
              className="border border-primary-foreground/30 text-primary-foreground px-6 py-3 rounded-md font-bold hover:bg-primary-foreground/10 transition-colors"
            >
              View Program
            </Link>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Scientific Themes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore cutting-edge research across six multidisciplinary tracks
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONFERENCE.themes.map((theme) => (
              <div
                key={theme}
                className="bg-card border border-border rounded-lg p-6 shadow-card hover:border-primary/40 transition-colors group"
              >
                <Lightbulb className="h-8 w-8 text-gold mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-lg font-semibold text-foreground">{theme}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="bg-muted py-16 px-4">
        <div className="container mx-auto max-w-4xl grid sm:grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <Calendar className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">3 Days of Innovation</h3>
              <p className="text-muted-foreground text-sm">
                Keynotes, panel discussions, poster sessions, and networking events across three action-packed days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">Venue</h3>
              <p className="text-muted-foreground text-sm">{CONFERENCE.venue}</p>
              <p className="text-muted-foreground text-sm">{CONFERENCE.location}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
