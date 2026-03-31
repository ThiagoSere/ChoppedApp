const PRESET_WORKOUTS = [
  {
    id: 'preset-chest-shoulders-triceps',
    isPreset: true,
    name: 'Pecho, Hombro y Triceps',
    exercises: [
      {
        exerciseId: 'preset-bench-press',
        name: 'Press banca',
        bodyPart: 'chest',
        target: 'pectorals',
        equipment: 'barbell',
        gifUrl: '',
      },
      {
        exerciseId: 'preset-overhead-press',
        name: 'Press militar',
        bodyPart: 'shoulders',
        target: 'delts',
        equipment: 'barbell',
        gifUrl: '',
      },
      {
        exerciseId: 'preset-triceps-dips',
        name: 'Fondos en paralelas',
        bodyPart: 'upper arms',
        target: 'triceps',
        equipment: 'body weight',
        gifUrl: '',
      },
    ],
  },
  {
    id: 'preset-back-arms',
    isPreset: true,
    name: 'Espalda y Brazo',
    exercises: [
      {
        exerciseId: 'preset-pull-up',
        name: 'Dominadas',
        bodyPart: 'back',
        target: 'lats',
        equipment: 'body weight',
        gifUrl: '',
      },
      {
        exerciseId: 'preset-barbell-row',
        name: 'Remo con barra',
        bodyPart: 'back',
        target: 'upper back',
        equipment: 'barbell',
        gifUrl: '',
      },
      {
        exerciseId: 'preset-biceps-curl',
        name: 'Curl de biceps',
        bodyPart: 'upper arms',
        target: 'biceps',
        equipment: 'dumbbell',
        gifUrl: '',
      },
    ],
  },
  {
    id: 'preset-legs',
    isPreset: true,
    name: 'Pierna',
    exercises: [
      {
        exerciseId: 'preset-squat',
        name: 'Sentadilla',
        bodyPart: 'upper legs',
        target: 'quads',
        equipment: 'barbell',
        gifUrl: '',
      },
      {
        exerciseId: 'preset-romanian-deadlift',
        name: 'Peso muerto rumano',
        bodyPart: 'upper legs',
        target: 'hamstrings',
        equipment: 'barbell',
        gifUrl: '',
      },
      {
        exerciseId: 'preset-lunges',
        name: 'Zancadas',
        bodyPart: 'upper legs',
        target: 'glutes',
        equipment: 'dumbbell',
        gifUrl: '',
      },
    ],
  },
];

export default PRESET_WORKOUTS;
