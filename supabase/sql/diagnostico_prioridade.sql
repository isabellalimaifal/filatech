-- ============================================
-- SCRIPT DE DIAGNÓSTICO E CORREÇÃO DE PRIORIDADE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR SE AS COLUNAS EXISTEM NA TABELA USUARIOS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
AND column_name IN ('tipo_prioridade', 'cargo');

-- 2. VERIFICAR SE AS COLUNAS EXISTEM NA TABELA TICKETS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND table_schema = 'public'
AND column_name IN ('prioridade_atendimento', 'guiche_atendimento');

-- 3. VERIFICAR DADOS ATUAIS DE USUÁRIOS
SELECT 
    id,
    nome,
    cpf,
    tipo_prioridade,
    cargo
FROM public.usuarios 
LIMIT 5;

-- 4. VERIFICAR DADOS ATUAIS DE TICKETS
SELECT 
    id,
    codigo,
    cpf,
    prioridade_atendimento,
    status,
    data_entrada
FROM public.tickets 
ORDER BY data_entrada DESC 
LIMIT 5;

-- 5. CRIAR COLUNAS SE NÃO EXISTIREM
-- Esta parte só vai executar se as colunas não existirem
DO $$
BEGIN
    -- Adicionar coluna tipo_prioridade em usuarios se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND table_schema = 'public' 
        AND column_name = 'tipo_prioridade'
    ) THEN
        ALTER TABLE public.usuarios 
        ADD COLUMN tipo_prioridade TEXT NOT NULL DEFAULT 'Nenhuma';
        RAISE NOTICE 'Coluna tipo_prioridade adicionada em usuarios';
    ELSE
        RAISE NOTICE 'Coluna tipo_prioridade já existe em usuarios';
    END IF;

    -- Adicionar coluna prioridade_atendimento em tickets se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND table_schema = 'public' 
        AND column_name = 'prioridade_atendimento'
    ) THEN
        ALTER TABLE public.tickets 
        ADD COLUMN prioridade_atendimento TEXT NOT NULL DEFAULT 'Normal';
        RAISE NOTICE 'Coluna prioridade_atendimento adicionada em tickets';
    ELSE
        RAISE NOTICE 'Coluna prioridade_atendimento já existe em tickets';
    END IF;

    -- Adicionar coluna cargo em usuarios se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND table_schema = 'public' 
        AND column_name = 'cargo'
    ) THEN
        ALTER TABLE public.usuarios 
        ADD COLUMN cargo TEXT NOT NULL DEFAULT 'cidadao';
        RAISE NOTICE 'Coluna cargo adicionada em usuarios';
    ELSE
        RAISE NOTICE 'Coluna cargo já existe em usuarios';
    END IF;

    -- Adicionar coluna guiche_atendimento em tickets se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND table_schema = 'public' 
        AND column_name = 'guiche_atendimento'
    ) THEN
        ALTER TABLE public.tickets 
        ADD COLUMN guiche_atendimento TEXT;
        RAISE NOTICE 'Coluna guiche_atendimento adicionada em tickets';
    ELSE
        RAISE NOTICE 'Coluna guiche_atendimento já existe em tickets';
    END IF;
END $$;

-- 6. ATUALIZAR USUÁRIOS EXISTENTES SEM TIPO_PRIORIDADE
UPDATE public.usuarios 
SET tipo_prioridade = 'Nenhuma' 
WHERE tipo_prioridade IS NULL OR tipo_prioridade = '';

-- 7. ATUALIZAR TICKETS EXISTENTES SEM PRIORIDADE_ATENDIMENTO
UPDATE public.tickets 
SET prioridade_atendimento = 'Normal' 
WHERE prioridade_atendimento IS NULL OR prioridade_atendimento = '';

-- 8. ADICIONAR COMENTÁRIOS NAS COLUNAS
COMMENT ON COLUMN public.usuarios.tipo_prioridade IS 
    'Necessidades especiais no cadastro: Nenhuma, Idoso (60+), Gestante/Lactante, PCD, Pessoa com Autismo.';

COMMENT ON COLUMN public.tickets.prioridade_atendimento IS 
    'Prioritário quando o usuário tem necessidade especial; senão Normal.';

COMMENT ON COLUMN public.usuarios.cargo IS 
    'Papel do usuário: cidadao (padrão) ou admin (atendente).';

COMMENT ON COLUMN public.tickets.guiche_atendimento IS 
    'Guichê ou mesa para onde o cidadão foi chamado (ex: Guichê Principal).';

-- 9. VERIFICAÇÃO FINAL - MOSTRAR RESULTADOS
SELECT '=== VERIFICAÇÃO FINAL ===' as status;

SELECT 
    'USUÁRIOS' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN tipo_prioridade != 'Nenhuma' THEN 1 END) as com_prioridade,
    COUNT(CASE WHEN tipo_prioridade = 'Nenhuma' THEN 1 END) as sem_prioridade
FROM public.usuarios;

SELECT 
    'TICKETS' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN prioridade_atendimento = 'Prioritário' THEN 1 END) as prioritarios,
    COUNT(CASE WHEN prioridade_atendimento = 'Normal' THEN 1 END) as normais
FROM public.tickets;

-- 10. EXEMPLO DE COMO CRIAR UM USUÁRIO ADMIN PARA TESTE
-- Descomente as linhas abaixo para criar um usuário admin
-- INSERT INTO public.usuarios (nome, cpf, telefone, senha, tipo_prioridade, cargo)
-- VALUES ('Administrador Teste', '12345678900', '11999999999', 'admin123', 'Nenhuma', 'admin')
-- ON CONFLICT (cpf) DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
