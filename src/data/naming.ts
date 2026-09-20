// Word-finding / naming practice content — synthetic only.
// The "picture" is an emoji (no images, no personal data).

export interface NamingItem {
  id: string;
  emoji: string;
  target: string;
  /** Semantic cue (given on first difficulty step). */
  cue: string;
  /** First-sound cue (given on the next step). */
  firstSound: string;
  category: string;
}

export const NAMING_ITEMS: NamingItem[] = [
  { id: 'cup', emoji: '☕', target: 'cup', cue: 'You drink tea or coffee from it', firstSound: 'c…', category: 'Kitchen' },
  { id: 'key', emoji: '🔑', target: 'key', cue: 'It opens a door', firstSound: 'k…', category: 'Household' },
  { id: 'watch', emoji: '⌚', target: 'watch', cue: 'You wear it to tell the time', firstSound: 'w…', category: 'Clothing' },
  { id: 'banana', emoji: '🍌', target: 'banana', cue: 'A long yellow fruit', firstSound: 'b…', category: 'Food' },
  { id: 'umbrella', emoji: '☂️', target: 'umbrella', cue: 'You open it when it rains', firstSound: 'u…', category: 'Household' },
  { id: 'glasses', emoji: '👓', target: 'glasses', cue: 'You wear them to see better', firstSound: 'g…', category: 'Clothing' },
  { id: 'cat', emoji: '🐱', target: 'cat', cue: 'A small animal that purrs', firstSound: 'c…', category: 'Animals' },
  { id: 'apple', emoji: '🍎', target: 'apple', cue: 'A round fruit that can be red or green', firstSound: 'a…', category: 'Food' },
  { id: 'shoes', emoji: '👟', target: 'shoes', cue: 'You put them on your feet', firstSound: 'sh…', category: 'Clothing' },
  { id: 'bed', emoji: '🛏️', target: 'bed', cue: 'You sleep in it', firstSound: 'b…', category: 'Home' },
  { id: 'bread', emoji: '🍞', target: 'bread', cue: 'You slice it to make toast', firstSound: 'b…', category: 'Food' },
  { id: 'dog', emoji: '🐶', target: 'dog', cue: 'A friendly animal that barks', firstSound: 'd…', category: 'Animals' },
  { id: 'phone', emoji: '📱', target: 'phone', cue: 'You use it to call people', firstSound: 'f…', category: 'Household' },
  { id: 'book', emoji: '📖', target: 'book', cue: 'You read it', firstSound: 'b…', category: 'Leisure' },
  { id: 'flower', emoji: '🌷', target: 'flower', cue: 'It grows in a garden and smells nice', firstSound: 'f…', category: 'Nature' },
  { id: 'chair', emoji: '🪑', target: 'chair', cue: 'You sit on it', firstSound: 'ch…', category: 'Home' },
  { id: 'milk', emoji: '🥛', target: 'milk', cue: 'A white drink that goes with cereal', firstSound: 'm…', category: 'Food' },
  { id: 'hat', emoji: '🧢', target: 'hat', cue: 'You wear it on your head', firstSound: 'h…', category: 'Clothing' },
  { id: 'clock', emoji: '⏰', target: 'clock', cue: 'It tells you the time and can ring', firstSound: 'c…', category: 'Household' },
  { id: 'bird', emoji: '🐦', target: 'bird', cue: 'An animal that flies and sings', firstSound: 'b…', category: 'Animals' },
];

export const NAMING_CATEGORIES = Array.from(
  new Set(NAMING_ITEMS.map((i) => i.category)),
);
