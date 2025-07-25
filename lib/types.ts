export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name?: string) => Promise<any>;
  logout: () => void;
  resetMessages: () => void;
  error: string | null;
  success: string | null;
  loading: boolean;
}