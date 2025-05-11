import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#2E382E] border-t border-teal-100 dark:border-teal-900 py-4 transition-colors duration-200">
      <div className="container mx-auto px-6">
        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-4">Development Links:</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/Register" className="text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline">Register</Link>
          <Link to="/Login" className="text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline">Login</Link>
          <Link to="/quizPage" className="text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline">Quiz</Link>
          <Link to="/geminiPage" className="text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline">Gemini</Link>

        </div>
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 SmartFit. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
