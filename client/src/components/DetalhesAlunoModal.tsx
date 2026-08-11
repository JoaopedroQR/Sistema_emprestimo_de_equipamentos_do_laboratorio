import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Emprestimo {
  id: string;
  equipment: string;
  borrowDate: string;
  dueDate: string;
  status: "active" | "overdue" | "returned";
}

interface DetalhesAlunoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    name: string;
    email: string;
    registration: string;
    hasPendency: boolean;
    activeLoanCount: number;
    emprestimos: Emprestimo[];
  };
  onResolvePendency: () => void;
}

export default function DetalhesAlunoModal({
  open,
  onOpenChange,
  student,
  onResolvePendency,
}: DetalhesAlunoModalProps) {
  const [showResolvePendency, setShowResolvePendency] = useState(false);
  const [devolvendoId, setDevolvendoId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Ativo
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800">
            Atrasado
          </Badge>
        );
      case "returned":
        return (
          <Badge className="bg-green-100 text-green-800">
            Devolvido
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleResolvePendency = () => {
    onResolvePendency();
    setShowResolvePendency(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Detalhes do Aluno
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Aluno */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Matrícula: {student.registration}
                </p>
              </div>
              {student.hasPendency && (
                <Badge className="bg-red-100 text-red-800">Pendência</Badge>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Empréstimos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {student.activeLoanCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total de Empréstimos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {student.emprestimos.length}
                </p>
              </div>
            </div>
          </div>

          {/* Histórico de Empréstimos */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Histórico de Empréstimos ({student.emprestimos.length})
            </h4>
            {student.emprestimos.length > 0 ? (
              <div className="space-y-2">
                {student.emprestimos.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {emp.equipment}
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div>
                            <p className="text-gray-600">Emprestado em</p>
                            <p className="text-gray-900">
                              {new Date(emp.borrowDate).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Devolução</p>
                            <p className="text-gray-900">
                              {new Date(emp.dueDate).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Status</p>
                            {getStatusBadge(emp.status)}
                          </div>
                        </div>
                      </div>
                      {emp.status !== "returned" && (
                        <Button
                          onClick={() => setDevolvendoId(emp.id)}
                          size="sm"
                          className="ml-3 bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                        >
                          Devolver
                        </Button>
                      )}
                    </div>
                    {devolvendoId === emp.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">
                          Confirma a devolução de {emp.equipment}?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setDevolvendoId(null)}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => {
                              setDevolvendoId(null);
                            }}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirmar Devolução
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                Nenhum empréstimo registrado
              </p>
            )}
          </div>

          {/* Resolver Pendência */}
          {student.hasPendency && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-red-900 mb-1">
                    Pendência Detectada
                  </h4>
                  <p className="text-sm text-red-800">
                    Este aluno possui equipamentos atrasados ou pendências não
                    resolvidas.
                  </p>
                </div>
                {!showResolvePendency && (
                  <Button
                    onClick={() => setShowResolvePendency(true)}
                    className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap ml-3"
                  >
                    Resolver
                  </Button>
                )}
              </div>

              {showResolvePendency && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-900 mb-3">
                    Tem certeza que deseja resolver a pendência deste aluno?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowResolvePendency(false)}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-900 hover:bg-red-100"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleResolvePendency}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
