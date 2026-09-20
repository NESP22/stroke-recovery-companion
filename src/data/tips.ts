// Caregiver and communication guidance — plain-language, evidence-aligned tips.
// These are informational and are NOT medical advice.

export interface Tip {
  id: string;
  title: string;
  body: string;
}

export const COMMUNICATION_TIPS: Tip[] = [
  {
    id: 'one-thing',
    title: 'Ask one thing at a time',
    body: 'Ask simple yes/no questions instead of open questions. Give the person time to answer without rushing them.',
  },
  {
    id: 'face-to-face',
    title: 'Face the person',
    body: 'Sit or stand where they can see your face. Speak at a normal volume and a calm pace.',
  },
  {
    id: 'write-support',
    title: 'Add writing or pictures',
    body: 'Offer a pen and paper, or point to pictures and objects to support your words.',
  },
  {
    id: 'no-interrupt',
    title: 'Do not finish their sentences',
    body: 'Let the person finish. If they are stuck, offer a gentle cue only if they want one.',
  },
  {
    id: 'rephrase',
    title: 'Rephrase if not understood',
    body: 'If they do not understand, try shorter words or say it a different way rather than repeating loudly.',
  },
  {
    id: 'normal-talk',
    title: 'Talk normally, not like a child',
    body: 'Keep a normal adult tone. Reduce background noise (TV, radio) so it is easier to focus.',
  },
];

export const CAREGIVER_TIPS: Tip[] = [
  {
    id: 'rest',
    title: 'Look after your own rest',
    body: 'Caregiving is tiring. Plan short breaks and do not feel guilty for resting — you help best when you are rested.',
  },
  {
    id: 'share',
    title: 'Share the load',
    body: 'Ask family, friends or services for help with specific tasks. You do not have to do everything alone.',
  },
  {
    id: 'signs',
    title: 'Know the warning signs',
    body: 'Learn the FAST signs of stroke (Face, Arms, Speech, Time). If new stroke symptoms appear, call emergency services immediately — do not wait.',
  },
  {
    id: 'therapy',
    title: 'Support therapy, do not replace it',
    body: 'This app is an adjunct to clinician-directed rehabilitation. Follow the plan from the speech, occupational or physiotherapy team.',
  },
  {
    id: 'communicate',
    title: 'Use communication tips',
    body: 'For a person with aphasia, the communication tips in this app can make everyday conversation easier.',
  },
  {
    id: 'own-health',
    title: 'Do not neglect your own health',
    body: 'Keep your own appointments and medicines. Carer strain is common — speak to a professional if you feel overwhelmed.',
  },
];

export const ESCALATION_GUIDANCE: Tip[] = [
  {
    id: 'stroke',
    title: 'New stroke symptoms',
    body: 'Face drooping, arm weakness, speech difficulty, sudden confusion or sudden trouble seeing. Call emergency services now.',
  },
  {
    id: 'falls',
    title: 'A fall or injury',
    body: 'If there is a fall, bleeding, head injury or bad pain, seek urgent medical help. Do not try to manage it alone.',
  },
  {
    id: 'mood',
    title: 'Persistent low mood',
    body: 'If low mood lasts more than two weeks, or there are thoughts of self-harm, contact a healthcare professional urgently. If someone is in immediate danger, call emergency services.',
  },
  {
    id: 'worse',
    title: 'Getting noticeably worse',
    body: 'If abilities suddenly get worse (weaker, more confused, slurred speech), treat it as urgent — seek medical help.',
  },
];
