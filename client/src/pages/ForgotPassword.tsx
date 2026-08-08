import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

type ForgotPasswordStep = "email" | "code" | "newpassword" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, navigate] = useLocation();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep("code");
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      setStep("newpassword");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      setStep("success");
    }
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {step !== "success" && (
          <button
            onClick={() => navigate("/")}
            className="mb-6 text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
          >
            ← Voltar ao Login
          </button>
        )}

        <Card className="p-8 border border-border shadow-lg">
          {step === "email" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Recuperar Senha
                </h1>
                <p className="text-sm text-gray-600">
                  Digite seu email para receber um código de recuperação
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu.email@academy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-border"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 h-10"
                >
                  Enviar Código
                </Button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Código de Recuperação
                </h1>
                <p className="text-sm text-gray-600">
                  Verifique seu email e digite o código recebido
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Código (6 dígitos)
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.slice(0, 6))}
                    className="w-full border-border text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 h-10"
                >
                  Verificar Código
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Usar outro email
                </button>
              </form>
            </>
          )}

          {step === "newpassword" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <span className="text-2xl">🔑</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Nova Senha
                </h1>
                <p className="text-sm text-gray-600">
                  Digite sua nova senha
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nova Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirmar Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-border"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 h-10"
                >
                  Atualizar Senha
                </Button>
              </form>
            </>
          )}

          {step === "success" && (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Sucesso!
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Sua senha foi atualizada com sucesso. Você pode fazer login
                  com sua nova senha.
                </p>

                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 h-10"
                >
                  Voltar ao Login
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
