import { committee } from "@/data/mockData";
import { Users, FlaskConical } from "lucide-react";

const Committee = () => {
  const organizing = committee.filter((m) => m.type === "organizing");
  const scientific = committee.filter((m) => m.type === "scientific");

  const Section = ({
    title,
    icon,
    members,
  }: {
    title: string;
    icon: React.ReactNode;
    members: typeof committee;
  }) => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div
            key={m.name + m.role}
            className="bg-card border border-border rounded-lg p-5 shadow-card hover:border-primary/30 transition-colors"
          >
            <h3 className="font-display text-lg font-semibold text-foreground">{m.name}</h3>
            <p className="text-gold text-sm font-medium mt-1">{m.role}</p>
            <p className="text-muted-foreground text-sm mt-1">{m.affiliation}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-24 pt-10 px-4">
      <div className="container mx-auto max-w-5xl space-y-14">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">The Committee</h1>
          <p className="text-muted-foreground">Meet the people behind ICSIT 2026</p>
        </div>
        <Section
          title="Organizing Committee"
          icon={<Users className="h-7 w-7 text-primary" />}
          members={organizing}
        />
        <Section
          title="Scientific Committee"
          icon={<FlaskConical className="h-7 w-7 text-teal" />}
          members={scientific}
        />
      </div>
    </div>
  );
};

export default Committee;
