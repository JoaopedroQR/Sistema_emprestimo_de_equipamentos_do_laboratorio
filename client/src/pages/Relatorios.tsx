import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar } from "lucide-react";

interface OverdueItem {
  id: string;
  equipment: string;
  student: string;
  borrowDate: string;
  dueDate: string;
  daysOverdue: number;
}

interface RankingItem {
  name: string;
  count: number;
}

export default function Relatorios() {
  const [, navigate] = useLocation();
  const [userRole, setUserRole] = useState<"admin" | "user">("admin");
  const [userName, setUserName] = useState("Usuário Demo");
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([]);
  const [topEquipments, setTopEquipments] = useState<RankingItem[]>([]);
  const [topStudents, setTopStudents] = useState<RankingItem[]>([]);
  const [totalBorrowed, setTotalBorrowed] = useState(0);

  const fetchRelatorios = async () => {
    try {
      // 1. Atrasados
      const resAtrasados = await fetch('http://localhost:8000/api/relatorios/atrasados');
      const dataAtrasados = await resAtrasados.json();
      setOverdueItems(dataAtrasados.map((item: any) => ({
        ...item,
        borrowDate: new Date(item.borrowdate).toLocaleDateString('pt-BR'),
        dueDate: new Date(item.duedate).toLocaleDateString('pt-BR'),
      })));

      // 2. Top Equipamentos
      const resTopEq = await fetch('http://localhost:8000/api/relatorios/top-equipamentos');
      const dataTopEq = await resTopEq.json();
      setTopEquipments(dataTopEq);

      // 3. Top Alunos
      const resTopAl = await fetch('http://localhost:8000/api/relatorios/top-alunos');
      const dataTopAl = await resTopAl.json();
      setTopStudents(dataTopAl);

      // 4. Estatísticas Gerais
      const resEq = await fetch('http://localhost:8000/api/equipamentos');
      const equipments = await resEq.json();
      const borrowedCount = equipments.filter((e: any) => e.status === 'borrowed' || e.active_loan_quantity > 0).length;
      setTotalBorrowed(borrowedCount);

    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  useEffect(() => {
    fetchRelatorios();
    const role = (localStorage.getItem("userRole") as "admin" | "user" | null) || "admin";
    const name = localStorage.getItem("userName") || "Usuário Demo";

    setUserRole(role);
    setUserName(name);
  }, [navigate]);

  const stats = [
    {
      label: "Equipamentos em Uso",
      value: totalBorrowed.toString(),
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Empréstimos Atrasados",
      value: overdueItems.length.toString(),
      color: "bg-red-50 border-red-200",
    },
    {
      label: "Alunos com Pendência",
      value: overdueItems.length.toString(), // Simplificação: atraso = pendência
      color: "bg-yellow-50 border-yellow-200",
    },
    /* Taxa de Pontualidade ocultada conforme solicitado
    {
      label: "Taxa de Pontualidade",
      value: totalBorrowed > 0 ? `${Math.round(((totalBorrowed - overdueItems.length) / totalBorrowed) * 100)}%` : "100%",
      color: "bg-green-50 border-green-200",
    },
    */
  ];

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
            <p className="text-gray-600 mt-1">
              Análise de empréstimos e atrasos
            </p>
          </div>
          {/* Botão Exportar Relatório ocultado conforme solicitado
          <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              className={`p-6 border-2 ${stat.color} hover:shadow-lg transition-shadow`}
            >
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Overdue Items */}
        <Card className="p-6 border-2 border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Equipamentos com Devolução Atrasada
            </h3>
            {/* Botão Filtrar por Data ocultado conforme solicitado
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Filtrar por Data
            </Button>
            */}
          </div>

          {overdueItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Equipamento
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Aluno
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Data de Empréstimo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Data de Devolução Prevista
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Dias em Atraso
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overdueItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {item.equipment}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{item.student}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.borrowDate}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{item.dueDate}</td>
                      <td className="py-3 px-4">
                        {item.daysOverdue > 0 ? (
                          <Badge className="bg-red-600 text-white">
                            {item.daysOverdue} dias
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600 text-white">
                            Vencido
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Contatar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Nenhum equipamento com atraso no momento
            </p>
          )}
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-2 border-border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Equipamentos Mais Emprestados
            </h3>
            <div className="space-y-3">
              {topEquipments.length > 0 ? (
                topEquipments.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-900">
                      {item.count}x
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado disponível</p>
              )}
            </div>
          </Card>

          <Card className="p-6 border-2 border-border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Alunos com Mais Empréstimos
            </h3>
            <div className="space-y-3">
              {topStudents.length > 0 ? (
                topStudents.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-900">
                      {item.count}x
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum dado disponível</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
