import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NovoAlunoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStudent: (student: {
    name: string;
    email: string;
    registration: string;
    phone?: string;
  }) => void;
}

export default function NovoAlunoModal({
  open,
  onOpenChange,
  onAddStudent,
}: NovoAlunoModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registration: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.registration.trim()) {
      newErrors.registration = "Matrícula é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onAddStudent({
      name: formData.name,
      email: formData.email,
      registration: formData.registration,
      phone: formData.phone || undefined,
    });

    setFormData({
      name: "",
      email: "",
      registration: "",
      phone: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      registration: "",
      phone: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Novo Aluno
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nome Completo *
            </label>
            <Input
              type="text"
              placeholder="João Silva"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full border-border ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Matrícula */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Matrícula *
            </label>
            <Input
              type="text"
              placeholder="2024001"
              value={formData.registration}
              onChange={(e) =>
                setFormData({ ...formData, registration: e.target.value })
              }
              className={`w-full border-border ${
                errors.registration ? "border-red-500" : ""
              }`}
            />
            {errors.registration && (
              <p className="text-xs text-red-600 mt-1">{errors.registration}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email *
            </label>
            <Input
              type="email"
              placeholder="joao.silva@academy.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full border-border ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Telefone (opcional)
            </label>
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border-border"
            />
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
              Adicionar Aluno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
