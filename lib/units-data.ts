export interface Unit {
  id: string
  nome: string
  tipo: "Saúde" | "Assistência Social" | "Trânsito"
  endereco: string
  aberto: boolean
  pessoasNaFila: number
  tempoEstimado: number
  imagem: string
  servicos: string[]
}

export const UNITS: Unit[] = [
  {
    id: "1",
    nome: "Posto de Saúde Central",
    tipo: "Saúde",
    endereco: "Rua das Flores, 123 - Centro",
    aberto: true,
    pessoasNaFila: 24,
    tempoEstimado: 35,
    imagem: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    servicos: ["Consulta Geral", "Vacinação", "Exames", "Farmácia"],
  },
  {
    id: "2",
    nome: "CRAS Vila Esperança",
    tipo: "Assistência Social",
    endereco: "Av. Brasil, 456 - Vila Esperança",
    aberto: true,
    pessoasNaFila: 12,
    tempoEstimado: 20,
    imagem: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    servicos: ["Cadastro Único", "Bolsa Família", "Orientação Social", "BPC"],
  },
  {
    id: "3",
    nome: "Detran - Unidade Centro",
    tipo: "Trânsito",
    endereco: "Rua São Paulo, 789 - Centro",
    aberto: true,
    pessoasNaFila: 38,
    tempoEstimado: 45,
    imagem: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    servicos: ["Renovação CNH", "Transferência", "Licenciamento", "Multas"],
  },
  {
    id: "4",
    nome: "UBS Jardim América",
    tipo: "Saúde",
    endereco: "Rua das Palmeiras, 321 - Jardim América",
    aberto: false,
    pessoasNaFila: 0,
    tempoEstimado: 0,
    imagem: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
    servicos: ["Consulta Geral", "Pediatria", "Vacinação"],
  },
  {
    id: "5",
    nome: "CRAS Centro",
    tipo: "Assistência Social",
    endereco: "Praça Central, 100 - Centro",
    aberto: true,
    pessoasNaFila: 8,
    tempoEstimado: 15,
    imagem: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80",
    servicos: ["Cadastro Único", "Bolsa Família", "Auxílio Brasil"],
  },
  {
    id: "6",
    nome: "Detran - Unidade Sul",
    tipo: "Trânsito",
    endereco: "Av. Sul, 2000 - Zona Sul",
    aberto: false,
    pessoasNaFila: 0,
    tempoEstimado: 0,
    imagem: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80",
    servicos: ["Renovação CNH", "Primeira Habilitação", "Licenciamento"],
  },
]

export function getUnitsByType(tipo: string | null): Unit[] {
  if (!tipo || tipo === "Todos") return UNITS
  return UNITS.filter((unit) => unit.tipo === tipo)
}

export function searchUnits(query: string, units: Unit[]): Unit[] {
  const lowerQuery = query.toLowerCase()
  return units.filter(
    (unit) =>
      unit.nome.toLowerCase().includes(lowerQuery) ||
      unit.endereco.toLowerCase().includes(lowerQuery) ||
      unit.tipo.toLowerCase().includes(lowerQuery)
  )
}
