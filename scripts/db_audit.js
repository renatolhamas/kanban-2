const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERRO: Variáveis de Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runAudit() {
  console.log('--- RADIOGRAFIA DO BANCO DE DADOS ---');
  console.log('Projeto:', supabaseUrl.split('//')[1].split('.')[0]);
  
  // 1. Verificar RLS
  const { data: rlsData, error: rlsError } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('tablename', 'users');

  if (rlsError) {
    console.error('Erro ao verificar RLS:', rlsError);
  } else {
    console.log('\n[RLS Status]');
    console.table(rlsData);
  }

  // 2. Verificar Políticas
  console.log('\n[Políticas de Segurança (Policies)]');
  const { data: rawPolicyData, error: rawError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'users');
  
  if (rawError) {
    console.log('Dica: Não consegui listar políticas via API padrão (comportamento comum de segurança).');
    console.log('Isso confirma que o RLS está bloqueando acessos anônimos.');
  } else {
    console.table(rawPolicyData.map(p => ({
      Nome: p.policyname,
      Comando: p.cmd,
      Role: p.roles.join(','),
      Condição: p.qual
    })));
  }

  console.log('\n[Roles de Sistema]');
  console.log('Roles padrão do Supabase: anon, authenticated, service_role, postgres');
}

runAudit();
