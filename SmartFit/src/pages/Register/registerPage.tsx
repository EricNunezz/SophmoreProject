import { RegisterForm } from "@/components/registerComponents/Register";
import Layout from "@/components/layoutComponent/Layout";


function Register() {
  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-800 dark:to-[#2E382E] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <RegisterForm />
      </div>
    </div>
    </Layout>
  );
}

export default Register;