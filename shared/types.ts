// shared/types.ts
export interface Aluno {
  id_aluno: number;
  nome: string;
  matricula: string;
  email?: string;
  telefone?: string;
  tem_pendencia: boolean;
}

export interface Equipamento {
  id_equipamento: number;
  nome: string;
  numero_serie: string;
  descricao?: string;
  status?: string;
  data_aquisicao?: string;
}

export interface Emprestimo {
  id_emprestimo: number;
  id_aluno: number;
  id_equipamento: number;
  data_emprestimo: string;
  data_devolucao_prevista: string;
  data_devolucao_real?: string;
  observacoes?: string;
}
