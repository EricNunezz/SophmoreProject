import { Quiz } from "@/components/quizComponents/Quiz";
import Layout from "@/components/layoutComponent/Layout";


function QuizPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-800 dark:to-[#2E382E] flex flex-col items-center justify-center p-6">
        <Quiz />
      </div>
    </Layout>
  );
}

export default QuizPage;
