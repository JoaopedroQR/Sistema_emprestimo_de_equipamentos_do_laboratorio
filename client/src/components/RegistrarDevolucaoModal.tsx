import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface StudentBorrowing {
  id_aluno: number;
  nome: string;
  email: string;
  quantidade_emprestada: number;
}

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
}

interface RegistrarDevolucaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onDevolver: (data: { id_aluno: number; quantidade: number }) => Promise<void>;
}

export default function RegistrarDevolucaoModal({
  open,
  onOpenChange,
  equipment,
  onDevolver,
}: RegistrarDevolucaoModalProps) {
  const [borrowingStudents, setBorrowingStudents] = useState<StudentBorrowing[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);

  const selectedStudent = borrowingStudents.find(
    (s) => s.id_aluno.toString() === selectedStudentId
  );

  useEffect(() => {
    if (open && equipment?.id) {
      fetchBorrowingStudents();
      setSelectedStudentId("");
      setQuantity("1");
    }
  }, [open, equipment?.id]);

  const fetchBorrowingStudents = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/equipamentos/${equipment?.id}/alunos`);
      const data = await res.json();
      setBorrowingStudents(data);
      if (data.length > 0) {
        setSelectedStudentId(data[0].id_aluno.toString());
      }
    } catch (error) {
      console.error("Erro ao buscar alunos que pegaram o equipamento:", error);
      toast.error("Erro ao carregar lista de alunos.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Selecione um aluno.");
      return;
    }

    setLoading(true);
    try {
      await onDevolver({
        id_aluno: parseInt(selectedStudentId),
        quantidade: parseInt(quantity),
      });
      onOpenChange(false);
    } catch (error) {
      // O erro já deve ser tratado pelo onDevolver (toast)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Registrar Devolução: {equipment?.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção do Aluno */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Aluno que está devolvendo *
            </label>
            <Select
              value={selectedStudentId}
              onValueChange={(value) => {
                setSelectedStudentId(value);
                setQuantity("1");
              }}
            >
              <SelectTrigger className="w-full border-border">
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {borrowingStudents.map((s) => (
                  <SelectItem key={s.id_aluno} value={s.id_aluno.toString()}>
                    {s.nome} ({s.quantidade_emprestada} unidade{s.quantidade_emprestada > 1 ? "s" : ""})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantidade */}
          {selectedStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Quantidade a devolver *
              </label>
              <Input
                type="number"
                min="1"
                max={selectedStudent.quantidade_emprestada}
                placeholder="Digite a quantidade"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  // Permite apenas números inteiros positivos e dentro do limite do aluno
                  if (val === "" || (/^[1-9]\d*$/.test(val) && parseInt(val) <= selectedStudent.quantidade_emprestada)) {
                    setQuantity(val);
                  }
                }}
                className="w-full border-border"
              />
              <p className="text-xs text-gray-500 mt-1">
                Máximo permitido: {selectedStudent.quantidade_emprestada} unidade(s)
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedStudentId}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loading ? "Processando..." : "Confirmar Devolução"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
