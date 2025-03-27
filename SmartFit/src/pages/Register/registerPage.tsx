import { RegisterForm } from "@/components/registerComponents/Register";

function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <RegisterForm />
      </div>
    </div>
  );
}

export default Register;