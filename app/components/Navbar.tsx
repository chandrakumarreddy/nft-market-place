import { Link } from "@remix-run/react";

export default function Navbar() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
        <ul className="right">
          <li>
            <Link to="/sell">Sell</Link>
          </li>
          <li>
            <Link to="/my-nfts">My NFTS</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/create">Create</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
