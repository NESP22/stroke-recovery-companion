// Communication-support phrase board for people with aphasia.
// Adjunct to speech-language therapy — not a substitute.

export interface Phrase {
  id: string;
  text: string;
  category: string;
}

export const PHRASES: Phrase[] = [
  { id: 'yes', text: 'Yes', category: 'Basic' },
  { id: 'no', text: 'No', category: 'Basic' },
  { id: 'thank-you', text: 'Thank you', category: 'Basic' },
  { id: 'please', text: 'Please', category: 'Basic' },
  { id: 'need-help', text: 'I need help', category: 'Needs' },
  { id: 'need-drink', text: 'I would like a drink', category: 'Needs' },
  { id: 'need-toilet', text: 'I need the toilet', category: 'Needs' },
  { id: 'need-rest', text: 'I need to rest', category: 'Needs' },
  { id: 'in-pain', text: 'I am in pain', category: 'Health' },
  { id: 'tired', text: 'I am tired', category: 'Health' },
  { id: 'dizzy', text: 'I feel dizzy', category: 'Health' },
  { id: 'not-well', text: 'I do not feel well', category: 'Health' },
  { id: 'speak-slow', text: 'Please speak more slowly', category: 'Conversation' },
  { id: 'say-again', text: 'Please say that again', category: 'Conversation' },
  { id: 'not-sure', text: 'I am not sure', category: 'Conversation' },
  { id: 'one-moment', text: 'One moment, please', category: 'Conversation' },
  { id: 'write-it', text: 'Please write it down', category: 'Conversation' },
  { id: 'yes-no', text: 'Please ask me yes or no questions', category: 'Conversation' },
  { id: 'hungry', text: 'I am hungry', category: 'Daily' },
  { id: 'cold', text: 'I am cold', category: 'Daily' },
  { id: 'hot', text: 'I am too hot', category: 'Daily' },
  { id: 'where-are-we', text: 'Where are we going?', category: 'Daily' },
];
