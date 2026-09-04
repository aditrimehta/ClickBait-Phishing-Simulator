export const DEMO_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Alice Vance',
    email: 'alice.vance@securecorp.net',
    department: 'IT',
    status: 'Training Attended',
    phishOutcome: 'Compromised'
  },
  {
    id: 'emp-2',
    name: 'Bob Miller',
    email: 'bob.miller@securecorp.net',
    department: 'HR',
    status: 'Training Sent',
    phishOutcome: 'Clicked'
  },
  {
    id: 'emp-3',
    name: 'Charlie Smith',
    email: 'charlie.smith@securecorp.net',
    department: 'Sales',
    status: 'Clicked',
    phishOutcome: 'Clicked'
  },
  {
    id: 'emp-4',
    name: 'Diana Prince',
    email: 'diana.prince@securecorp.net',
    department: 'Tech',
    status: 'Pending',
    phishOutcome: null
  }
];

export const DEMO_LOGS = [
  {
    time: '09:12:04',
    text: 'System initialized. 4 employees loaded.'
  },
  {
    time: '09:30:15',
    text: 'Alice Vance (IT) submitted credentials to sus-domain.'
  },
  {
    time: '09:35:44',
    text: 'Bob Miller (HR) clicked on simulation link.'
  },
  {
    time: '10:02:11',
    text: 'Charlie Smith (Sales) clicked on simulation link.'
  },
  {
    time: '10:15:00',
    text: 'Sent training invitation to Bob Miller (HR).'
  },
  {
    time: '10:45:22',
    text: 'Alice Vance (IT) completed security awareness training.'
  }
];