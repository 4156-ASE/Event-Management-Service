export interface UserInterface {
  pid: string;
  cid: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'admin' | 'regular';
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      pid: string;
      first_name: string;
      last_name: string;
      email: string;
      user_type: 'admin' | 'regular';
    };
    token: string;
    expires_in: number;
  };
}
