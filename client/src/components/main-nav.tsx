import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
        Dashboard
      </Link>
      <Link to="/applications" className="text-sm font-medium transition-colors hover:text-primary">
        Applications
      </Link>
      <Link to="/interviews" className="text-sm font-medium transition-colors hover:text-primary">
        Interviews
      </Link>
    </nav>
  );
} 