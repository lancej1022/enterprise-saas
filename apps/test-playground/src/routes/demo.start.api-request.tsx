import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

function getNames() {
  return fetch("/api/demo-names").then((res) => res.json());
}

export const Route = createFileRoute("/demo/start/api-request")({
  component: Home,
});

function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- from tsrouter cli
  const { data: names = [] } = useQuery({
    queryKey: ["names"],
    queryFn: getNames,
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 text-white"
      style={{
        backgroundColor: "#000",
        backgroundImage:
          "radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)",
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border-8 border-black/10 bg-black/50 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-4 text-2xl">Start API Request Demo - Names List</h1>
        <ul className="mb-4 space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any -- from tsrouter cli */}
          {names.map((name: any) => (
            <li
              className="rounded-lg border border-white/20 bg-white/10 p-3 shadow-md backdrop-blur-sm"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- from tsrouter cli
              key={name}
            >
              <span className="text-lg text-white">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
