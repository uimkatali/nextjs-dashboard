export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
