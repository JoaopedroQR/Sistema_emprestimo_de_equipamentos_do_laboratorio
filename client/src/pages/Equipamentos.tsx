import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import EmprestarEquipamentoModal from "@/components/EmprestarEquipamentoModal";
import RegistrarDevolucaoModal from "@/components/RegistrarDevolucaoModal";
import EditarEquipamentoModal from "@/components/EditarEquipamentoModal";
import NovoEquipamentoModal from "@/components/NovoEquipamentoModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  status: "available" | "borrowed" | "maintenance";
  quantity: number;
  totalQuantity: number;
  activeLoanQuantity: number;
  borrowedBy?: string;
  dueDate?: string;
  image?: string;
}

export default function Equipamentos() {
  const [, navigate] = useLocation();
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [userName, setUserName] = useState("Usuário Demo");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [emprestarModalOpen, setEmprestarModalOpen] = useState(false);
  const [devolucaoModalOpen, setDevolucaoModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [novoEquipamentoModalOpen, setNovoEquipamentoModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [equipments, setEquipments] = useState<Equipment[]>([
    // {
    //   id: "1",
    //   name: "Notebook Lenovo",
    //   serialNumber: "LNV-2024-001",
    //   status: "available",
    //   quantity: 10,
    // },
    // {
    //   id: "2",
    //   name: "Notebook Dell",
    //   serialNumber: "DLL-2024-001",
    //   status: "borrowed",
    //   quantity: 2,
    //   borrowedBy: "João Silva",
    //   dueDate: "2024-08-10",
    // },
    // {
    //   id: "3",
    //   name: "Microscópio Digital",
    //   serialNumber: "MIC-2024-001",
    //   status: "borrowed",
    //   quantity: 1,
    //   borrowedBy: "Maria Santos",
    //   dueDate: "2024-08-04",
    // },
    // {
    //   id: "4",
    //   name: "Osciloscópio",
    //   serialNumber: "OSC-2024-001",
    //   status: "maintenance",
    //   quantity: 1,
    // },
    // {
    //   id: "5",
    //   name: "Notebook Acer",
    //   serialNumber: "ACR-2024-001",
    //   status: "available",
    //   quantity: 8,
    // },
  // ]);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const fetchEquipments = async () => {
    try {
      // FORÇANDO A PORTA 8000 DO PYTHON
      const response = await fetch('http://localhost:8000/api/equipamentos' );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedData = data.map((item: any) => ({
          id: (item.id_equipamento || "").toString(),
          name: item.nome || "Sem Nome",
          serialNumber: item.numero_serie || "S/N",
          status: item.status || 'available',
          quantity: item.quantidade || 0,
          totalQuantity: (item.quantidade || 0) + (item.active_loan_quantity || 0),
          activeLoanQuantity: item.active_loan_quantity || 0,
        }));
        setEquipments(mappedData);
      }
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/alunos');
      const data = await response.json();
      // Mapeia os alunos do banco para o formato que o Modal espera
      const mappedStudents = data.map((s: any) => ({
        id: s.id_aluno.toString(),
        name: s.nome,
        email: s.email
      }));
      setStudents(mappedStudents); // Salva na lista de alunos
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    }
  };

  const handleDeleteEquipment = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o equipamento ${name}?`)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/equipamentos/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success("Equipamento excluído com sucesso!");
        fetchEquipments();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Erro ao excluir equipamento.");
      }
    } catch (error) {
      toast.error("Erro de conexão ao excluir equipamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
    fetchStudents();
    const role = (localStorage.getItem("userRole") as "admin" | "user" | null) || "user";
    const name = localStorage.getItem("userName") || "Usuário Demo";

    setUserRole(role);
    setUserName(name);
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-100 text-green-800">Disponível</Badge>
        );
      case "borrowed":
        return (
          <Badge className="bg-blue-100 text-blue-800">Emprestado</Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>
        );
      default:
        return null;
    }
  };

  // FILTRO SEGURO (Evita o erro toLowerCase)
  const filteredEquipments = (equipments || []).filter((eq) => {
    const name = (eq.name || "").toLowerCase();
    const serial = (eq.serialNumber || "").toLowerCase();
    const search = (searchTerm || "").toLowerCase();
    
    const matchesSearch = name.includes(search) || serial.includes(search);
    const matchesFilter = filterStatus === "all" || eq.status === filterStatus;
    return matchesSearch && matchesFilter;
  });


  const availableCount = equipments.filter(
    (e) => e.status === "available"
  ).length;
  const borrowedCount = equipments.filter(
    (e) => e.status === "borrowed"
  ).length;
  const maintenanceCount = equipments.filter(
    (e) => e.status === "maintenance"
  ).length;

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Equipamentos</h2>
            <p className="text-gray-600 mt-1">
              Gerenciar inventário de equipamentos do laboratório
            </p>
          </div>
          {userRole === "admin" && (
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={() => setNovoEquipamentoModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Equipamento
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Disponíveis</p>
            <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
          </Card>
          <Card className="p-4 border border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Emprestados</p>
            <p className="text-2xl font-bold text-gray-900">{borrowedCount}</p>
          </Card>
          <Card className="p-4 border border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Em Manutenção</p>
            <p className="text-2xl font-bold text-gray-900">
              {maintenanceCount}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou número de série..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={
                  filterStatus === "all"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-300"
                }
              >
                <Filter className="w-4 h-4 mr-2" />
                Todos
              </Button>
              <Button
                variant={filterStatus === "available" ? "default" : "outline"}
                onClick={() => setFilterStatus("available")}
                className={
                  filterStatus === "available"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-gray-300"
                }
              >
                Disponíveis
              </Button>
              <Button
                variant={filterStatus === "borrowed" ? "default" : "outline"}
                onClick={() => setFilterStatus("borrowed")}
                className={
                  filterStatus === "borrowed"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-300"
                }
              >
                Emprestados
              </Button>
            </div>
          </div>
        </Card>

        {/* Equipment List */}
        <div className="space-y-3">
          {filteredEquipments.length > 0 ? (
            filteredEquipments.map((equipment) => (
              <Card
                key={equipment.id}
                className="p-4 border-2 border-border hover:border-red-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">🖥️</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {equipment.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          S/N: {equipment.serialNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className="mt-1">{getStatusBadge(equipment.status)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantidade:</span>
                        <p className="font-semibold text-gray-900">
                          {equipment.quantity} disponível de {equipment.totalQuantity}
                        </p>
                      </div>
                      {equipment.borrowedBy && (
                        <>
                          <div>
                            <span className="text-gray-600">Emprestado para:</span>
                            <p className="font-semibold text-gray-900">
                              {equipment.borrowedBy}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Devolução:</span>
                            <p className="font-semibold text-gray-900">
                              {equipment.dueDate}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedEquipment(equipment);
                        setEmprestarModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Emprestar
                    </Button>
                    {/* O botão Devolver aparece se houver ao menos 1 empréstimo ativo */}
                    {(equipment.activeLoanQuantity > 0) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setDevolucaoModalOpen(true);
                        }}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Registrar Devolução
                      </Button>
                    )}
                    {/* Botão Editar ocultado conforme solicitado
                    {userRole === "admin" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setEditarModalOpen(true);
                        }}
                        variant="outline"
                        className="border-gray-300 text-gray-900 hover:bg-gray-50"
                      >
                        Editar
                      </Button>
                    )}
                    */}
                    {/* Botão de Excluir Equipamento: Apenas se o total estiver disponível (sem empréstimos ativos) */}
                    {equipment.activeLoanQuantity === 0 && userRole === "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDeleting}
                        onClick={() => handleDeleteEquipment(equipment.id, equipment.name)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 border-2 border-border text-center">
              <p className="text-gray-600">Nenhum equipamento encontrado</p>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedEquipment && (
        <>
          {/* <EmprestarEquipamentoModal
            open={emprestarModalOpen}
            onOpenChange={setEmprestarModalOpen}
            equipmentName={selectedEquipment.name}
            onConfirm={(data) => {
              toast.success(`Empréstimo registrado: ${selectedEquipment.name}`);
              setEmprestarModalOpen(false);
            }}
          /> */}
          <EmprestarEquipamentoModal
              open={emprestarModalOpen}
              onOpenChange={setEmprestarModalOpen}
              equipment={selectedEquipment}
              students={students}
              onConfirm={async (data) => {
                try {
                  const res = await fetch('http://localhost:8000/api/emprestimos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id_aluno: data.studentId,
                      id_equipamento: selectedEquipment?.id,
                      data_devolucao_prevista: data.dueDate,
                      quantidade: data.quantity || 1,
                      observacoes: data.notes || ""
                    })
                  });
                  
                  const resultData = await res.json();
                  if (!res.ok) {
                    toast.error(resultData.detail || "Erro ao realizar empréstimo.");
                    return;
                  }

                  await fetchEquipments();
                  setEmprestarModalOpen(false);
                  toast.success("Empréstimo realizado com sucesso!");
                } catch (error) {
                  toast.error("Erro de conexão ao realizar empréstimo.");
                }
              }}
            />
          {/* <RegistrarDevolucaoModal
            open={devolucaoModalOpen}
            onOpenChange={setDevolucaoModalOpen}
            equipmentName={selectedEquipment.name}
            onConfirm={(data) => {
              toast.success(`Devolução registrada: ${selectedEquipment.name}`);
              setDevolucaoModalOpen(false);
            }}
          /> */}
          <RegistrarDevolucaoModal
            open={devolucaoModalOpen}
            onOpenChange={setDevolucaoModalOpen}
            equipment={selectedEquipment}
            onDevolver={async (data) => {
              try {
                const res = await fetch('http://localhost:8000/api/devolucao', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    id_equipamento: selectedEquipment?.id,
                    id_aluno: data.id_aluno,
                    quantidade: data.quantidade
                  })
                });
                
                if (!res.ok) {
                  const errorData = await res.json();
                  toast.error(errorData.detail || "Erro ao processar devolução.");
                  return;
                }

                await fetchEquipments();
                toast.success("Equipamento devolvido com sucesso!");
              } catch (error) {
                toast.error("Erro de conexão ao processar devolução.");
              }
            }}
          />
          <EditarEquipamentoModal
            open={editarModalOpen}
            onOpenChange={setEditarModalOpen}
            equipment={{
              name: selectedEquipment.name,
              serialNumber: selectedEquipment.serialNumber,
              quantity: selectedEquipment.quantity,
              emprestimos: [
                {
                  id: "1",
                  studentName: selectedEquipment.borrowedBy || "N/A",
                  studentEmail: "aluno@academy.com",
                  borrowDate: "2024-08-01",
                  dueDate: selectedEquipment.dueDate || "2024-08-08",
                  quantity: 1,
                },
              ],
            }}
            onConfirm={(data) => {
              toast.success(`Equipamento atualizado: ${selectedEquipment.name}`);
              setEditarModalOpen(false);
            }}
          />
        </>
      )}

      {/* <NovoEquipamentoModal
        open={novoEquipamentoModalOpen}
        onOpenChange={setNovoEquipamentoModalOpen}
        onAddEquipment={(newEq) => {
          const equipment: Equipment = {
            ...newEq,
            id: (equipments.length + 1).toString(),
          };
          setEquipments([equipment, ...equipments]);
          toast.success(`Equipamento adicionado: ${newEq.name}`);
        }}
      /> */}

      <NovoEquipamentoModal
        open={novoEquipamentoModalOpen}
        onOpenChange={setNovoEquipamentoModalOpen}
        onAddEquipment={async (newEq) => {
          try {
            // 1. Envia para o seu Banco de Dados via API
            const response = await fetch('http://localhost:8000/api/equipamentos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nome: newEq.name,
                quantidade: newEq.quantity,
                numero_serie: newEq.serialNumber,
                descricao: newEq.description || "",
                status: "available",
                data_aquisicao: new Date().toISOString().split('T')[0] // Data de hoje
              })
            });

            if (response.ok) {
              // 2. Se salvou no banco, busca a lista atualizada para mostrar na tela
              await fetchEquipments(); 
              toast.success(`Equipamento salvo no banco: ${newEq.name}`);
              setNovoEquipamentoModalOpen(false);
            } else {
              toast.error("Erro ao salvar no banco de dados.");
            }
          } catch (error) {
            console.error("Erro na conexão:", error);
            toast.error("Não foi possível conectar ao servidor.");
          }
        }}
      />

    </DashboardLayout>
  );
}
