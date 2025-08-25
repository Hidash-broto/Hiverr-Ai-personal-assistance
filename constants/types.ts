export interface TaskTypes {
  title: string,
  description: string,
  status: string,
  user: { name: string, email: string },
  priority: string,
  dueDate: Date | null,
  _id: string
}

export interface CreateTaskProps {
  title: string,
  description: string,
  priority: string,
  dueDate?: Date | null
}

export interface CreateEventProps {
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  location: {
    address: string,
    latitude: number,
    longitude: number
  },
  attendees: string[]
}

export interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number: string; label?: string }[];
  emails?: { email: string; label?: string }[];
  // Add more fields if needed based on Contacts.Contact
}
