// Activities of daily living (ADL) routine checklists.

export interface Checklist {
  id: string;
  title: string;
  timeOfDay: string;
  items: string[];
}

export const CHECKLISTS: Checklist[] = [
  {
    id: 'morning',
    title: 'Morning routine',
    timeOfDay: 'Morning',
    items: [
      'Sit on the edge of the bed for a moment before standing',
      'Use the bathroom',
      'Wash my face and brush my teeth',
      'Get dressed',
      'Have breakfast',
      'Take morning medication (if prescribed)',
    ],
  },
  {
    id: 'midday',
    title: 'Midday routine',
    timeOfDay: 'Midday',
    items: [
      'Have lunch',
      'Take midday medication (if prescribed)',
      'Drink a glass of water',
      'Have a short rest',
      'Do one gentle activity',
    ],
  },
  {
    id: 'evening',
    title: 'Evening routine',
    timeOfDay: 'Evening',
    items: [
      'Have dinner',
      'Take evening medication (if prescribed)',
      'Do a calming activity (reading, music, quiet time)',
      'Get ready for bed',
      'Set out tomorrow’s clothes',
    ],
  },
];
