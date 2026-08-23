import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(() => Promise.resolve({ data: [] })),
    delete: jest.fn(),
  },
}));

// Chat/Historico pull in react-markdown (ESM-only), which CRA's Jest transform
// can't parse without ejecting. App-level tests only need their presence, not
// their internals, so replace them with lightweight stubs.
jest.mock('./components/Chat', () => () => <div data-testid="chat-stub" />);
jest.mock('./components/Historico', () => () => <div data-testid="historico-stub" />);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('exibe o formulário de login por padrão quando não há usuário salvo', () => {
  render(<App />);
  expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Acessar Sistema/i })).toBeInTheDocument();
});

test('exibe mensagem de erro quando o login falha', async () => {
  axios.post.mockRejectedValueOnce(new Error('Request failed'));
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Sua senha'), { target: { value: 'senhaerrada' } });
  fireEvent.click(screen.getByRole('button', { name: /Acessar Sistema/i }));

  await waitFor(() => {
    expect(screen.getByText('Email ou senha inválidos')).toBeInTheDocument();
  });
});

test('faz login com sucesso e mostra a saudação do usuário', async () => {
  axios.post.mockResolvedValueOnce({
    data: { _id: '1', name: 'Administrador Zonas', email: 'admin@zonas.com', token: 'fake-token' },
  });
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'admin@zonas.com' } });
  fireEvent.change(screen.getByPlaceholderText('Sua senha'), { target: { value: 'senha123' } });
  fireEvent.click(screen.getByRole('button', { name: /Acessar Sistema/i }));

  await waitFor(() => {
    expect(screen.getByText(/Olá, Administrador/i)).toBeInTheDocument();
  });
  expect(JSON.parse(localStorage.getItem('user')).token).toBe('fake-token');
});

test('alterna para o formulário de criação de conta e valida senha curta', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Criar conta gratuita/i }));

  expect(screen.getByText('Criar Conta')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Novo Usuário' } });
  fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'novo@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: '123' } });
  fireEvent.click(screen.getByRole('button', { name: /Começar Agora/i }));

  expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

test('logout limpa a sessão e volta para a tela de login', async () => {
  localStorage.setItem(
    'user',
    JSON.stringify({ _id: '1', name: 'Administrador Zonas', email: 'admin@zonas.com', token: 'fake-token' })
  );
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Olá, Administrador/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: /Sair/i }));

  expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
  expect(localStorage.getItem('user')).toBeNull();
});
