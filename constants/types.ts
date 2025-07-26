export interface TaskTypes {
  title: string,
  description: string,
  status: string,
  user: { name: string, email: string },
  priority: string,
  dueDate: Date | null,
  _id: string
}