/** Opções salvas em `usuarios.tipo_prioridade` (Supabase). */
export const OPCOES_NECESSIDADES_ESPECIAIS = [
  "Nenhuma",
  "Idoso (60+)",
  "Gestante/Lactante",
  "PCD",
  "Pessoa com Autismo",
] as const

export type OpcaoNecessidadeEspecial = (typeof OPCOES_NECESSIDADES_ESPECIAIS)[number]

/** Valores persistidos em `tickets.prioridade_atendimento`. */
export type PrioridadeAtendimentoTicket = "Prioritário" | "Normal"

export function usuarioTemPrioridadeNaFila(
  tipoPrioridade: string | undefined | null
): boolean {
  const t = (tipoPrioridade ?? "Nenhuma").trim()
  return t !== "" && t !== "Nenhuma"
}
