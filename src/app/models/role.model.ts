export interface Role {
  id: string;
  name: string;
  color: string;
  departmentId: string;
  // We can add a sortOrder later if we want to make roles draggable too
}