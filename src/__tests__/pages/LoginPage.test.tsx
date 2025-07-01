import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { AuthProvider, useAuth } from '../../contexts/AuthContext'; // Adjust path

// Mock useAuth hook
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual, // Preserve other exports like AuthProvider if any
    useAuth: () => ({
      login: vi.fn(),
      isAuthenticated: false,
      user: null,
      isLoading: false,
      // Add any other properties/methods returned by your useAuth hook
    }),
  };
});

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));


// Wrapper component to provide necessary context (Router, AuthProvider)
const renderLoginPage = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider> {/* Real AuthProvider to ensure context is there for useAuth mock */}
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<div>Profile Page Mock</div>} /> {/* For redirect testing */}
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};


describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should render login form elements', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /Connectez-vous à votre compte/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Adresse Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    expect(screen.getByText(/créez un nouveau compte/i)).toBeInTheDocument();
  });

  it('should allow typing into email and password fields', async () => {
    renderLoginPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/Adresse Email/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/Mot de passe/i) as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');

    await user.type(passwordInput, 'password123');
    expect(passwordInput.value).toBe('password123');
  });

  it('should display validation error for invalid email format', async () => {
    renderLoginPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/Adresse Email/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    await user.type(emailInput, 'invalid-email');
    // No need to type password for this specific email validation test if submit is prevented by email error first
    // However, RHF might require all fields to be touched or valid for some schemas before individual errors show on submit
    // Let's fill password too to be safe for RHF behavior
    const passwordInput = screen.getByPlaceholderText(/Mot de passe/i);
    await user.type(passwordInput, 'password123'); // Valid password
    await user.click(submitButton);

    const errorMessage = await screen.findByText(/Veuillez entrer une adresse email valide./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('should display validation error for short password', async () => {
    renderLoginPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/Adresse Email/i);
    const passwordInput = screen.getByPlaceholderText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    await user.type(emailInput, 'test@example.com'); // Valid email
    await user.type(passwordInput, '123'); // Invalid short password
    await user.click(submitButton);

    const errorMessage = await screen.findByText(/Le mot de passe doit contenir au moins 6 caractères./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('should call login function and navigate on successful submission (mocked)', async () => {
    const { login: mockLogin } = useAuth();

    renderLoginPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/Adresse Email/i);
    const passwordInput = screen.getByPlaceholderText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
        'mock-jwt-token-12345'
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

});
