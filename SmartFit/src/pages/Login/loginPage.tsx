import { LoginForm } from "@/components/loginComponents/Login";

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;