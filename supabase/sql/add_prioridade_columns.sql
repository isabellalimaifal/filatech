-- Rode no SQL Editor do Supabase se as colunas ainda não existirem.

alter table public.usuarios
  add column if not exists tipo_prioridade text not null default 'Nenhuma';

alter table public.tickets
  add column if not exists prioridade_atendimento text not null default 'Normal';

comment on column public.usuarios.tipo_prioridade is
  'Necessidades especiais no cadastro: Nenhuma, Idoso (60+), Gestante/Lactante, PCD, Pessoa com Autismo.';

comment on column public.tickets.prioridade_atendimento is
  'Prioritário quando o usuário tem necessidade especial; senão Normal.';
