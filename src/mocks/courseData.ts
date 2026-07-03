export type SectionId = 'ia-intro' | 'ia-marketing' | 'ia-content' | 'cas-pratique' | 'synthese'

export const PLAN_SECTIONS = [
  { id: 'ia-intro'     as SectionId, title: "Introduction à l'IA générative", overDuration: '10 min', optDuration: '10 min', overMinutes: 10, optMinutes: 10 },
  { id: 'ia-marketing' as SectionId, title: 'IA et analyse marketing',         overDuration: '30 min', optDuration: '30 min', overMinutes: 30, optMinutes: 30 },
  { id: 'ia-content'   as SectionId, title: 'IA et création de contenu',       overDuration: '35 min', optDuration: '35 min', overMinutes: 35, optMinutes: 35 },
  { id: 'cas-pratique' as SectionId, title: 'Cas pratique',                    overDuration: '37 min', optDuration: '30 min', overMinutes: 37, optMinutes: 30 },
  { id: 'synthese'     as SectionId, title: 'Synthèse et questions',           overDuration: '20 min', optDuration: '13 min', overMinutes: 20, optMinutes: 13 },
]

export const OVER_SECTIONS = new Set<SectionId>(['cas-pratique', 'synthese'])

export const GENERATED_COURSE = {
  title: 'IA & marketing digital',
  fullTitle: "Introduction à l'IA appliquée au marketing digital",
  school: 'ESD Bordeaux',
  instructor: 'Julien Bertrand',
  standardDurationLabel: '1h58',
  standardDurationMinutes: 118,
  calibratedDurationLabel: '2h04',
  calibratedDurationMinutes: 124,
  targetDuration: '2h00',
  slidesCount: 18,
  plan: [
    { title: "Introduction à l'IA générative", duration: '10 min', minutes: 10 },
    { title: 'IA et analyse marketing',         duration: '30 min', minutes: 30 },
    { title: 'IA et création de contenu',       duration: '35 min', minutes: 35 },
    { title: 'Cas pratique',                    duration: '30 min', minutes: 30 },
    { title: 'Synthèse et questions',           duration: '13 min', minutes: 13 },
  ],
  exercise: '1 atelier guidé de 30 min',
  recommendation: 'Ajouter 2 minutes de questions si le groupe est participatif.',
  wpm: 132,
}
