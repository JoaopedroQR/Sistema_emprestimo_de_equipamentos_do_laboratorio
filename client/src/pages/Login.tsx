import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userName", email.split("@")[0]);
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 border border-border shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-xl mb-4">
              <span className="text-3xl font-bold text-white">L</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lab Loan System
            </h1>
            <p className="text-sm text-gray-600">
              Huawei ICT Academy - Controle de Empréstimos
            </p>
            <p className="text-xs text-gray-500 mt-3 bg-blue-50 border border-blue-200 rounded py-2 px-3">
              Acesso Administrativo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@huawei-academy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-border pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 h-10"
            >
              Entrar
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <button
              onClick={handleForgotPassword}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Esqueceu a senha?
            </button>
          </div>
        </Card>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2">🔍 Demo - Use qualquer credencial</p>
          <p>Email: qualquer@email.com</p>
          <p>Senha: qualquer senha</p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Sistema de Controle de Empréstimos de Equipamentos de Laboratório</p>
        </div>
      </div>
    </div>
  );
}
