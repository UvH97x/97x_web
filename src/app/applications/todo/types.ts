// types.ts
export interface Todo {
  id: number;
  todoName: string;
  completed: boolean;
  dueDate: Date | null;
  tags: string[];
}