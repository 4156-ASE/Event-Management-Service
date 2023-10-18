export interface UserInterface {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    token: string;
    expires_in: number;
  };
}
