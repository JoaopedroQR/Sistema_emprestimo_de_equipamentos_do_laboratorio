import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Package } from "lucide-react";

interface LoanItem {
  id: string;
  equipment: string;
  borrowDate: string;
  dueDate: string;
  status: "active" | "overdue" | "returned";
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [userName, setUserName] = useState("Usuário Demo");
  const [loans, setLoans] = useState<LoanItem[]>([
    {
      id: "1",
      equipment: "Notebook Lenovo",
      borrowDate: "2024-08-01",
      dueDate: "2024-08-08",
      status: "active",
    },
    {
      id: "2",
      equipment: "Microscópio Digital",
      borrowDate: "2024-07-28",
      dueDate: "2024-08-04",
      status: "overdue",
    },
    {
      id: "3",
      equipment: "Osciloscópio",
      borrowDate: "2024-07-20",
      dueDate: "2024-07-27",
      status: "returned",
    },
  ]);

  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "admin" | "user" | null) || "user";
    const name = localStorage.getItem("userName") || "Usuário Demo";

    setUserRole(role);
    setUserName(name);
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Atrasado
          </Badge>
        );
      case "returned":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Devolvido
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = [
    {
      label: "Empréstimos Ativos",
      value: loans.filter((l) => l.status === "active").length,
      color: "bg-white border-gray-200",
    },
    {
      label: "Atrasados",
      value: loans.filter((l) => l.status === "overdue").length,
      color: "bg-white border-gray-200",
    },
    {
      label: "Devolvidos",
      value: loans.filter((l) => l.status === "returned").length,
      color: "bg-white border-gray-200",
    },
    {
      label: "Total de Equipamentos",
      value: "45",
      color: "bg-white border-gray-200",
    },
  ];

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {userName}!
          </h2>
          <p className="text-gray-600">
            {userRole === "admin"
              ? "Painel de controle do sistema de empréstimos"
              : "Gerencie seus empréstimos de equipamentos"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              className={`p-6 border ${stat.color} hover:shadow-lg transition-shadow`}
            >
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Loans */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-2 border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Empréstimos Recentes
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/equipamentos")}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Ver Todos
                </Button>
              </div>

              <div className="space-y-3">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-600 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {loan.equipment}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Emprestado em: {loan.borrowDate} | Devolução:
                          {loan.dueDate}
                        </p>
                      </div>
                      <div>{getStatusBadge(loan.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="p-6 border-2 border-border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Ações Rápidas
              </h3>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/equipamentos")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Pegar Equipamento
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/equipamentos")}
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                >
                  Devolver Equipamento
                </Button>

                {userRole === "admin" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/alunos")}
                      className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
                    >
                      Gerenciar Alunos
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate("/relatorios")}
                      className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
                    >
                      Ver Relatórios
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6 border-2 border-red-200 bg-red-50 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Atenção:</strong> Você tem 1 empréstimo atrasado. Por
                favor, devolva o equipamento o mais breve possível.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
