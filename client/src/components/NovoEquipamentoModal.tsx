import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NovoEquipamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEquipment: (equipment: {
    name: string;
    serialNumber: string;
    status: "available" | "borrowed" | "maintenance";
    quantity: number;
  }) => void;
}

export default function NovoEquipamentoModal({
  open,
  onOpenChange,
  onAddEquipment,
}: NovoEquipamentoModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    status: "available" as "available" | "borrowed" | "maintenance",
    quantity: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Número de série é obrigatório";
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantidade deve ser maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onAddEquipment({
      name: formData.name,
      serialNumber: formData.serialNumber,
      status: "available", // Sempre disponível ao criar
      quantity: formData.quantity,
    });

    // Reset form
    setFormData({
      name: "",
      serialNumber: "",
      status: "available",
      quantity: 1,
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      serialNumber: "",
      status: "available",
      quantity: 1,
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Novo Equipamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nome do Equipamento *
            </label>
            <Input
              type="text"
              placeholder="Ex: Notebook Lenovo"
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

          {/* Número de Série */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Número de Série *
            </label>
            <Input
              type="text"
              placeholder="Ex: LNV-2024-001"
              value={formData.serialNumber}
              onChange={(e) =>
                setFormData({ ...formData, serialNumber: e.target.value })
              }
              className={`w-full border-border ${
                errors.serialNumber ? "border-red-500" : ""
              }`}
            />
            {errors.serialNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.serialNumber}</p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Quantidade *
            </label>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
              }
              className={`w-full border-border ${
                errors.quantity ? "border-red-500" : ""
              }`}
            />
            {errors.quantity && (
              <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
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
              Adicionar Equipamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
