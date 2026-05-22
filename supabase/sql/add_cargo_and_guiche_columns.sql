-- Rode no SQL Editor do Supabase se as colunas ainda não existirem.

-- Coluna de cargo no usuário para controle de acesso ao painel admin
alter table public.usuarios
  add column if not exists cargo text not null default 'cidadao';

comment on column public.usuarios.cargo is
  'Papel do usuário: cidadao (padrão) ou admin (atendente).';

-- Coluna de guichê no ticket para registrar onde o cidadão foi chamado
alter table public.tickets
  add column if not exists guiche text;

comment on column public.tickets.guiche is
  'Guichê ou mesa para onde o cidadão foi chamado (ex: Guichê Principal).';
