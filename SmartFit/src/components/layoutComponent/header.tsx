import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-teal-100 sticky top-0 z-10">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-teal-500">SmartFit</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
