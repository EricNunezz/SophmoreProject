import supabase from "@/lib/supabaseClient";
import { Link, useNavigate, useLocation} from "react-router-dom";
import { useTheme } from "@/lib/ThemeProvider";
import { SunIcon, MoonIcon } from "lucide-react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async() => {
    try{
      await supabase.auth.signOut();
      console.log('Logged out successfully');
      navigate('/login');

    }catch (error){
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-[#2E382E] border-b border-teal-100 dark:border-teal-900 sticky top-0 z-10 transition-colors duration-200">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-teal-500 dark:text-teal-400">SmartFit</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
          {location.pathname === '/dashboard' && (
            <button 
              onClick={handleLogout} 
              className="text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
