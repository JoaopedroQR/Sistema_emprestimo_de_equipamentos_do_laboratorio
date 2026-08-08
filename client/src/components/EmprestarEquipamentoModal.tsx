import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface EmprestarEquipamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentName: string;
  onConfirm: (data: {
    studentName: string;
    studentEmail: string;
    quantity: number;
    dueDate: string;
  }) => void;
}

// Lista de alunos registrados (pode vir de uma API)
const STUDENTS: Student[] = [
  { id: "1", name: "João Silva", email: "joao.silva@academy.com" },
  { id: "2", name: "Maria Santos", email: "maria.santos@academy.com" },
  { id: "3", name: "Pedro Oliveira", email: "pedro.oliveira@academy.com" },
  { id: "4", name: "Ana Costa", email: "ana.costa@academy.com" },
  { id: "5", name: "Carlos Mendes", email: "carlos.mendes@academy.com" },
];

export default function EmprestarEquipamentoModal({
  open,
  onOpenChange,
  equipmentName,
  onConfirm,
}: EmprestarEquipamentoModalProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    quantity: "1",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedStudent = STUDENTS.find((s) => s.id === formData.studentId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Selecione um aluno";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Data de devolução é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onConfirm({
      studentName: selectedStudent?.name || "",
      studentEmail: selectedStudent?.email || "",
      quantity: parseInt(formData.quantity),
      dueDate: formData.dueDate,
    });

    setFormData({
      studentId: "",
      quantity: "1",
      dueDate: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      studentId: "",
      quantity: "1",
      dueDate: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Emprestar: {equipmentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Aluno */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Aluno *
            </label>
            <Select value={formData.studentId} onValueChange={(value) => {
              setFormData({ ...formData, studentId: value });
              setErrors({ ...errors, studentId: "" });
            }}>
              <SelectTrigger className={`w-full border-border ${
                errors.studentId ? "border-red-500" : ""
              }`}>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {STUDENTS.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && (
              <p className="text-xs text-red-600 mt-1">{errors.studentId}</p>
            )}
          </div>

          {/* Email do Aluno (preenchido automaticamente) */}
          {selectedStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email do Aluno
              </label>
              <Input
                type="email"
                value={selectedStudent.email}
                disabled
                className="w-full border-border bg-gray-50"
              />
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Quantidade *
            </label>
            <Select value={formData.quantity} onValueChange={(value) =>
              setFormData({ ...formData, quantity: value })
            }>
              <SelectTrigger className="w-full border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data de Devolução */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Data de Devolução *
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => {
                setFormData({ ...formData, dueDate: e.target.value });
                setErrors({ ...errors, dueDate: "" });
              }}
              className={`w-full border-border ${
                errors.dueDate ? "border-red-500" : ""
              }`}
            />
            {errors.dueDate && (
              <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
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
              Confirmar Empréstimo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
