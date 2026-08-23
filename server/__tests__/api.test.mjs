// Automated API test suite for the Zonas backend.
// Run with: node server/__tests__/api.test.mjs
// Requires the backend (npm run server) and MongoDB to be running.

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  \x1b[31m✗\x1b[0m ${message}`);
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }
  return { status: res.status, body };
}

const uniqueEmail = `teste_${Date.now()}@example.com`;
let token;
let createdQueryId;

async function run() {
  console.log('\n== Autenticação ==');

  {
    const { status, body } = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Usuário Teste', email: uniqueEmail, password: 'senha123' }),
    });
    assert(status === 201, `Registro de novo usuário retorna 201 (recebido ${status})`);
    assert(body && typeof body.token === 'string', 'Resposta de registro contém token JWT');
  }

  {
    const { status } = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Duplicado', email: uniqueEmail, password: 'senha123' }),
    });
    assert(status === 400, `Registro com email duplicado é rejeitado com 400 (recebido ${status})`);
  }

  {
    const { status, body } = await request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@zonas.com', password: 'senha123' }),
    });
    assert(status === 200, `Login com credenciais válidas (admin seed) retorna 200 (recebido ${status})`);
    assert(body && typeof body.token === 'string', 'Login retorna token JWT');
    token = body?.token;
  }

  {
    const { status } = await request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@zonas.com', password: 'senhaerrada' }),
    });
    assert(status === 401, `Login com senha incorreta é rejeitado com 401 (recebido ${status})`);
  }

  console.log('\n== Proteção de rotas ==');

  {
    const { status } = await request('/api/query/history');
    assert(status === 401, `Acesso ao histórico sem token é bloqueado com 401 (recebido ${status})`);
  }

  {
    const { status } = await request('/api/query/history', {
      headers: { Authorization: 'Bearer token_invalido' },
    });
    assert(status === 401, `Acesso ao histórico com token inválido é bloqueado com 401 (recebido ${status})`);
  }

  console.log('\n== Consultas de zoneamento ==');

  {
    const { status, body } = await request('/api/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    assert(status === 400, `Consulta sem corpo "query" retorna 400 (recebido ${status})`);
    assert(body && body.error, 'Resposta de erro contém mensagem explicativa');
  }

  {
    // General question fallback path (no address geocodable) — exercises OpenAI integration.
    const { status, body } = await request('/api/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: 'O que significa o Coeficiente de Aproveitamento?' }),
    });
    assert(status === 200, `Dúvida geral (fallback IA) retorna 200 (recebido ${status})`);
    assert(body && typeof body.resumo === 'string' && body.resumo.length > 0, 'Resposta de dúvida geral contém texto gerado pela IA');
    assert(body && body.resultado === null, 'Dúvida geral não retorna painel de zoneamento (resultado=null)');
  }

  {
    // Real address query — exercises Google Maps + ArcGIS + OpenAI integration end-to-end.
    const { status, body } = await request('/api/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: 'Avenida Higienópolis, 500, Londrina' }),
    });
    assert(status === 200, `Consulta por endereço real retorna 200 (recebido ${status})`);
    if (body && body.resultado) {
      assert(!!body.resultado.zona, 'Resultado contém a sigla da zona identificada');
      assert(!!body.coordenadas && !!body.coordenadas.latitude, 'Resultado contém coordenadas geocodificadas');
    } else {
      console.log('  \x1b[33m! aviso:\x1b[0m endereço caiu no fallback de dúvida geral (ArcGIS/Google Maps pode estar indisponível)');
    }
  }

  console.log('\n== Histórico ==');

  {
    const { status, body } = await request('/api/query/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(status === 200, `Consulta de histórico retorna 200 (recebido ${status})`);
    assert(Array.isArray(body), 'Histórico retorna uma lista');
    assert(body.length >= 2, `Histórico contém as consultas recém-criadas (encontradas: ${body?.length})`);
    createdQueryId = body?.[0]?._id;
  }

  {
    const { status } = await request(`/api/query/${createdQueryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(status === 200, `Exclusão de item do histórico retorna 200 (recebido ${status})`);
  }

  {
    const { status } = await request('/api/query/000000000000000000000000', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(status === 404, `Exclusão de item inexistente retorna 404 (recebido ${status})`);
  }

  console.log('\n== Resumo ==');
  console.log(`${passed} passaram, ${failed} falharam de ${passed + failed} verificações.\n`);
  if (failed > 0) {
    console.log('Falhas:');
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error('Erro fatal ao executar a suíte de testes:', err);
  process.exitCode = 1;
});
