export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}
