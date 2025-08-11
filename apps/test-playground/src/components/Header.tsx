import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="flex justify-between gap-2 bg-white p-2 text-black">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to=".">Simple Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to=".">Address Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to=".">Sentry</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to=".">Start - Server Functions</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to=".">Start - API Request</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to=".">TanStack Query</Link>
        </div>
      </nav>
    </header>
  );
}
