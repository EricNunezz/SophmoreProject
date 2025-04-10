import supabase from "@/lib/supabaseClient";
import { Link, useNavigate, useLocation} from "react-router-dom";


export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

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
    <header className="w-full bg-white border-b border-teal-100 sticky top-0 z-10">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-teal-500">SmartFit</span>
        </Link>
        {location.pathname === '/dashboard' && (
          <button onClick={handleLogout} className = "text-teal-500 hover:text-teal-700">
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
