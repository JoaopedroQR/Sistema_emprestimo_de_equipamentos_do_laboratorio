import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import NovoAlunoModal from "@/components/NovoAlunoModal";
import DetalhesAlunoModal from "@/components/DetalhesAlunoModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  registration: string;
  activeLoanCount: number;
  hasPendency: boolean;
  lastLoan?: string;
}

export default function Alunos() {
  const [, navigate] = useLocation();
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [userName, setUserName] = useState("Usuário Demo");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPendency, setFilterPendency] = useState<string>("all");
  const [novoAlunoModalOpen, setNovoAlunoModalOpen] = useState(false);
  const [detalhesModalOpen, setDetalhesModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // const [students, setStudents] = useState<Student[]>([
  //   {
  //     id: "1",
  //     name: "João Silva",
  //     email: "joao.silva@academy.com",
  //     registration: "2024001",
  //     activeLoanCount: 2,
  //     hasPendency: false,
  //     lastLoan: "Notebook Lenovo",
  //   },
  //   {
  //     id: "2",
  //     name: "Maria Santos",
  //     email: "maria.santos@academy.com",
  //     registration: "2024002",
  //     activeLoanCount: 1,
  //     hasPendency: true,
  //     lastLoan: "Microscópio Digital",
  //   },
  //   {
  //     id: "3",
  //     name: "Pedro Oliveira",
  //     email: "pedro.oliveira@academy.com",
  //     registration: "2024003",
  //     activeLoanCount: 0,
  //     hasPendency: false,
  //   },
  //   {
  //     id: "4",
  //     name: "Ana Costa",
  //     email: "ana.costa@academy.com",
  //     registration: "2024004",
  //     activeLoanCount: 3,
  //     hasPendency: false,
  //     lastLoan: "Osciloscópio",
  //   },
  //   {
  //     id: "5",
  //     name: "Carlos Mendes",
  //     email: "carlos.mendes@academy.com",
  //     registration: "2024005",
  //     activeLoanCount: 1,
  //     hasPendency: true,
  //     lastLoan: "Notebook Dell",
  //   },
  // ]);

  const [students, setStudents] = useState<Student[]>([]);

  const fetchAlunos = async () => {
    try {
      const response = await fetch('/api/alunos');
      const data = await response.json();
      // Traduzimos id_aluno do banco para id que o front espera
      const mappedData = data.map((a: any) => ({
        ...a,
        id: a.id_aluno.toString(),
        name: a.nome,
        registration: a.matricula
      }));
      setStudents(mappedData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  const handleAddStudent = (newStudent: {
    name: string;
    email: string;
    registration: string;
    phone?: string;
  }) => {
    const student: Student = {
      id: String(students.length + 1),
      name: newStudent.name,
      email: newStudent.email,
      registration: newStudent.registration,
      activeLoanCount: 0,
      hasPendency: false,
    };

    setStudents([...students, student]);
    toast.success(`Aluno ${newStudent.name} adicionado com sucesso!`);
  };

  useEffect(() => {
    fetchAlunos();
    const role = (localStorage.getItem("userRole") as "admin" | "user" | null) || "user";
    const name = localStorage.getItem("userName") || "Usuário Demo";

    setUserRole(role);
    setUserName(name);
  }, [navigate]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration.includes(searchTerm);

    const matchesFilter =
      filterPendency === "all" ||
      (filterPendency === "pending" && student.hasPendency) ||
      (filterPendency === "clean" && !student.hasPendency);

    return matchesSearch && matchesFilter;
  });

  const pendingStudents = students.filter((s) => s.hasPendency).length;
  const activeLoans = students.reduce((sum, s) => sum + s.activeLoanCount, 0);

  return (
    <DashboardLayout userRole={userRole} userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Alunos</h2>
            <p className="text-gray-600 mt-1">
              Gerenciar alunos e suas pendências
            </p>
          </div>
          {userRole === "admin" && (
            <Button
              onClick={() => setNovoAlunoModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Total de Alunos</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </Card>
          <Card className="p-4 border border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Com Pendências</p>
            <p className="text-2xl font-bold text-gray-900">{pendingStudents}</p>
          </Card>
          <Card className="p-4 border border-gray-200 bg-white">
            <p className="text-sm text-gray-600">Empréstimos Ativos</p>
            <p className="text-2xl font-bold text-gray-900">{activeLoans}</p>
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
                  placeholder="Buscar por nome, email ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPendency === "all" ? "default" : "outline"}
                onClick={() => setFilterPendency("all")}
                className={
                  filterPendency === "all"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-300"
                }
              >
                Todos
              </Button>
              <Button
                variant={filterPendency === "clean" ? "default" : "outline"}
                onClick={() => setFilterPendency("clean")}
                className={
                  filterPendency === "clean"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-gray-300"
                }
              >
                Sem Pendências
              </Button>
              <Button
                variant={filterPendency === "pending" ? "default" : "outline"}
                onClick={() => setFilterPendency("pending")}
                className={
                  filterPendency === "pending"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-gray-300"
                }
              >
                Com Pendências
              </Button>
            </div>
          </div>
        </Card>

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Card
                key={student.id}
                className={`p-4 border-2 transition-colors ${
                  student.hasPendency
                    ? "border-red-200 bg-red-50 hover:border-red-400"
                    : "border-border hover:border-red-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {student.name}
                          </h3>
                          {student.hasPendency && (
                            <Badge className="bg-red-600 text-white">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pendência
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          Matrícula: {student.registration}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-gray-900">
                          {student.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Empréstimos Ativos:</span>
                        <p className="font-semibold text-gray-900">
                          {student.activeLoanCount}
                        </p>
                      </div>
                      {student.lastLoan && (
                        <div>
                          <span className="text-gray-600">Último Empréstimo:</span>
                          <p className="font-medium text-gray-900">
                            {student.lastLoan}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setDetalhesModalOpen(true);
                      }}
                      variant="outline"
                      className="border-gray-300 text-gray-900 hover:bg-gray-100"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 border-2 border-border text-center">
              <p className="text-gray-600">Nenhum aluno encontrado</p>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Novo Aluno */}
      <NovoAlunoModal
        open={novoAlunoModalOpen}
        onOpenChange={setNovoAlunoModalOpen}
        onAddStudent={async (newStudent) => {
          try {
            // 1. Envia para o seu Banco de Dados via API
            const response = await fetch('/api/alunos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                // Aqui garantimos que pegamos o valor correto, não importa o nome no modal
                nome: newStudent.name || newStudent.nome,
                matricula: newStudent.registration || newStudent.matricula || newStudent.id,
                email: newStudent.email || "",
                telefone: newStudent.phone || newStudent.telefone || ""
              })
            });

            if (response.ok) {
              // 2. Chama a função que criamos para recarregar a lista do banco
              await fetchAlunos(); 
              toast.success(`Aluno salvo no banco com sucesso!`);
              setNovoAlunoModalOpen(false);
            } else {
              const errorData = await response.json();
              toast.error(`Erro no banco: ${errorData.error || "Verifique os dados"}`);
            }
          } catch (error) {
            console.error("Erro na conexão:", error);
            toast.error("Não foi possível conectar ao servidor backend.");
          }
        }}
      />

      {/* Modal de Detalhes do Aluno */}
      {selectedStudent && (
        <DetalhesAlunoModal
          open={detalhesModalOpen}
          onOpenChange={setDetalhesModalOpen}
          student={{
            ...selectedStudent,
            emprestimos: [
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
                borrowDate: "2024-07-25",
                dueDate: "2024-08-04",
                status: "overdue",
              },
            ],
          }}
          onResolvePendency={() => {
            setStudents(
              students.map((s) =>
                s.id === selectedStudent.id
                  ? { ...s, hasPendency: false }
                  : s
              )
            );
            toast.success("Pendência resolvida com sucesso!");
            setDetalhesModalOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
