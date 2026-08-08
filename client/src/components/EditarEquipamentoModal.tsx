import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface Emprestimo {
  id: string;
  studentName: string;
  studentEmail: string;
  borrowDate: string;
  dueDate: string;
  quantity: number;
}

interface EditarEquipamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: {
    name: string;
    serialNumber: string;
    quantity: number;
    status?: string;
    emprestimos: Emprestimo[];
  };
  onConfirm: (data: {
    quantity: number;
    status?: string;
    emprestimos: Emprestimo[];
  }) => void;
}

export default function EditarEquipamentoModal({
  open,
  onOpenChange,
  equipment,
  onConfirm,
}: EditarEquipamentoModalProps) {
  const [quantity, setQuantity] = useState(String(equipment.quantity));
  const [status, setStatus] = useState(equipment.status || "available");
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>(equipment.emprestimos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState("");

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleEditDate = (id: string) => {
    const emp = emprestimos.find((e) => e.id === id);
    if (emp) {
      setEditingId(id);
      setEditingDate(emp.dueDate);
    }
  };

  const handleSaveDate = () => {
    if (editingId && editingDate) {
      setEmprestimos(
        emprestimos.map((e) =>
          e.id === editingId ? { ...e, dueDate: editingDate } : e
        )
      );
      setEditingId(null);
      setEditingDate("");
    }
  };

  const handleDeleteEmprestimo = (id: string) => {
    setEmprestimos(emprestimos.filter((e) => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      quantity: parseInt(quantity) || 0,
      status,
      emprestimos,
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    setQuantity(String(equipment.quantity));
    setStatus(equipment.status || "available");
    setEmprestimos(equipment.emprestimos);
    setEditingId(null);
    setEditingDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Editar: {equipment.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Quantidade Total
            </label>
            <Input
              type="number"
              min="0"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full border-border"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="borrowed">Emprestado</SelectItem>
                <SelectItem value="maintenance">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empréstimos */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Empréstimos Ativos ({emprestimos.length})
            </h3>
            {emprestimos.length > 0 ? (
              <div className="space-y-3">
                {emprestimos.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {emp.studentName}
                        </p>
                        <p className="text-xs text-gray-600">{emp.studentEmail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmprestimo(emp.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <p className="text-gray-600">Quantidade</p>
                        <p className="font-medium text-gray-900">
                          {emp.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Emprestado em</p>
                        <p className="font-medium text-gray-900">
                          {new Date(emp.borrowDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Devolução</p>
                        <p className="font-medium text-gray-900">
                          {new Date(emp.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {editingId === emp.id ? (
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            Nova data de devolução
                          </label>
                          <Input
                            type="date"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="w-full border-border text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveDate}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          className="border-gray-300"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDate(emp.id)}
                        className="border-gray-300 text-gray-900 hover:bg-gray-50 w-full"
                      >
                        Alterar Data de Devolução
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                Nenhum empréstimo ativo
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
