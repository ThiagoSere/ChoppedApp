import { useEffect, useMemo, useState } from 'react';

function normalize(url) {
  if (!url || typeof url !== 'string') return '';
  const v = url.trim();
  if (!v) return '';
  if (v.startsWith('//')) return `https:${v}`;
  if (v.startsWith('http://')) return v.replace('http://', 'https://');
  return v;
}

function buildCandidates(exercise) {
  const direct = normalize(exercise?.gifUrl || '');
  const id = (exercise?.exerciseId || '').trim();

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const out = [];

  if (direct) out.push(direct);
  if (id && !id.startsWith('preset-')) {
    out.push(`${apiBase}/exercises/gif/${id}`);
  }

  return [...new Set(out)];
}

export default function ExerciseGif({ exercise, className, alt }) {
  const candidates = useMemo(() => buildCandidates(exercise), [exercise]);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const candidatesKey = useMemo(() => candidates.join('|'), [candidates]);

  useEffect(() => {
    setIdx(0);
    setFailed(false);
  }, [candidatesKey]);

  if (!candidates.length || failed) {
    return <div className={`${className} result-gif-empty`}>Sin GIF</div>;
  }

  return (
    <img
      src={candidates[idx]}
      alt={alt || exercise?.name || 'Ejercicio'}
      className={className}
      loading="lazy"
      onError={() => {
        if (idx < candidates.length - 1) setIdx((v) => v + 1);
        else setFailed(true);
      }}
    />
  );
}
