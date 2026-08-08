import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegistrarDevolucaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentName: string;
  onConfirm: (data: {
    equipmentId: string;
    quantity: number;
    observations?: string;
  }) => void;
}

// Lista de IDs de equipamentos registrados (pode vir de uma API)
const EQUIPMENT_IDS = [
  "SN-LNV-2024-001",
  "SN-LNV-2024-002",
  "SN-LNV-2024-003",
  "SN-DLL-2024-001",
  "SN-DLL-2024-002",
  "SN-MIC-2024-001",
  "SN-OSC-2024-001",
  "SN-ACR-2024-001",
  "SN-ACR-2024-002",
];

export default function RegistrarDevolucaoModal({
  open,
  onOpenChange,
  equipmentName,
  onConfirm,
}: RegistrarDevolucaoModalProps) {
  const [formData, setFormData] = useState({
    equipmentId: "",
    quantity: "1",
    observations: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipmentId) {
      newErrors.equipmentId = "Selecione o ID do equipamento";
    }

    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      newErrors.quantity = "Quantidade deve ser maior que 0";
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
      equipmentId: formData.equipmentId,
      quantity: parseInt(formData.quantity),
      observations: formData.observations || undefined,
    });

    setFormData({
      equipmentId: "",
      quantity: "1",
      observations: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      equipmentId: "",
      quantity: "1",
      observations: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Registrar Devolução: {equipmentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID do Equipamento */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              ID do Equipamento *
            </label>
            <Select value={formData.equipmentId} onValueChange={(value) => {
              setFormData({ ...formData, equipmentId: value });
              setErrors({ ...errors, equipmentId: "" });
            }}>
              <SelectTrigger className={`w-full border-border ${
                errors.equipmentId ? "border-red-500" : ""
              }`}>
                <SelectValue placeholder="Selecione o ID" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.equipmentId && (
              <p className="text-xs text-red-600 mt-1">{errors.equipmentId}</p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Quantidade Devolvida *
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              placeholder="1"
              value={formData.quantity}
              onChange={(e) => {
                setFormData({ ...formData, quantity: e.target.value });
                setErrors({ ...errors, quantity: "" });
              }}
              className={`w-full border-border ${
                errors.quantity ? "border-red-500" : ""
              }`}
            />
            {errors.quantity && (
              <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Observações (opcional)
            </label>
            <Input
              type="text"
              placeholder="Ex: Equipamento com pequeno arranhão"
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Confirmar Devolução
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
