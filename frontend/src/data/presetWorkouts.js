const PRESET_WORKOUTS = [
  {
    id: 'preset-chest-shoulders-triceps',
    isPreset: true,
    name: 'Pecho, Hombro y Triceps',
    exercises: [
      {
        exerciseId: 'EIeI8Vf',
        name: 'Press de banca con barra',
        bodyPart: 'chest',
        target: 'pectorals',
        equipment: 'barbell',
        gifUrl: 'https://static.exercisedb.dev/media/EIeI8Vf.gif',
      },
      {
        exerciseId: 'Kyd9Rz5',
        name: 'Press militar con barra',
        bodyPart: 'shoulders',
        target: 'delts',
        equipment: 'barbell',
        gifUrl: 'https://static.exercisedb.dev/media/Kyd9Rz5.gif',
      },
      {
        exerciseId: '05Cf2v8',
        name: 'Fondos en paralelas',
        bodyPart: 'upper arms',
        target: 'triceps',
        equipment: 'body weight',
        gifUrl: 'https://static.exercisedb.dev/media/05Cf2v8.gif',
      },
    ],
  },
  {
    id: 'preset-back-arms',
    isPreset: true,
    name: 'Espalda y Brazo',
    exercises: [
      {
        exerciseId: '0V2YQjW',
        name: 'Dominadas',
        bodyPart: 'back',
        target: 'lats',
        equipment: 'body weight',
        gifUrl: 'https://static.exercisedb.dev/media/0V2YQjW.gif',
      },
      {
        exerciseId: 'eZyBC3j',
        name: 'Remo con barra',
        bodyPart: 'back',
        target: 'upper back',
        equipment: 'barbell',
        gifUrl: 'https://static.exercisedb.dev/media/eZyBC3j.gif',
      },
      {
        exerciseId: '2NpxjC1',
        name: 'Curl de biceps con mancuernas',
        bodyPart: 'upper arms',
        target: 'biceps',
        equipment: 'dumbbell',
        gifUrl: 'https://static.exercisedb.dev/media/2NpxjC1.gif',
      },
    ],
  },
  {
    id: 'preset-legs',
    isPreset: true,
    name: 'Pierna',
    exercises: [
      {
        exerciseId: 'DhMl549',
        name: 'Sentadilla con barra',
        bodyPart: 'upper legs',
        target: 'glutes',
        equipment: 'barbell',
        gifUrl: 'https://static.exercisedb.dev/media/DhMl549.gif',
      },
      {
        exerciseId: 'o6LqKKP',
        name: 'Peso muerto rumano',
        bodyPart: 'upper legs',
        target: 'hamstrings',
        equipment: 'barbell',
        gifUrl: 'https://static.exercisedb.dev/media/o6LqKKP.gif',
      },
      {
        exerciseId: 'SSsBDwB',
        name: 'Zancadas con mancuernas',
        bodyPart: 'upper legs',
        target: 'glutes',
        equipment: 'dumbbell',
        gifUrl: 'https://static.exercisedb.dev/media/SSsBDwB.gif',
      },
    ],
  },
];

export default PRESET_WORKOUTS;
