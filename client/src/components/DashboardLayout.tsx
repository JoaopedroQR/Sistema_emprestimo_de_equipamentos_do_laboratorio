import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: "admin" | "user";
  userName?: string;
}

export default function DashboardLayout({
  children,
  userRole = "user",
  userName = "Usuário",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    {
      label: "Equipamentos",
      href: "/equipamentos",
      icon: "🖥️",
    },
    {
      label: "Alunos",
      href: "/alunos",
      icon: "👥",
    },
    ...(userRole === "admin"
      ? [
          {
            label: "Relatórios",
            href: "/relatorios",
            icon: "📋",
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <span className="font-bold text-gray-900 hidden sm:inline">
                Lab Loan
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-secondary"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={`w-full justify-start gap-3 hover:bg-secondary text-gray-700 ${
                !sidebarOpen && "justify-center"
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        <Separator />

        {/* User Profile */}
        <div className="p-4 space-y-3">
          {sidebarOpen && (
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Conectado como</p>
              <p className="font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {userRole === "admin" ? "Administrador" : "Aluno"}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`w-full ${!sidebarOpen && "w-10 h-10 p-0"}`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Empréstimo
          </h1>
          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
