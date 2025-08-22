export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string; // Optional property
  dob?: string;
  phone?: {
    code: string;
    number: string;
  };
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    department?: string; // This is for the address (e.g., state/province)
    country?: string;
  };
  startDate?: string;
  departmentId: string | null; // The department they work in
  vacationBalance: number;
  status: 'Active' | 'Terminated';
  role: 'User' | 'Manager' | 'General Manager';
  managedDepartmentIds?: string[];
  terminationDate?: string | null;
  terminationReason?: string | null;
  isVisible: boolean;
}