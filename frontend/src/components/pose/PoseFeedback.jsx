function getFeedback(joint, angle) {
  if (angle == null) return { status: 'idle', msg: 'No detectado' };

  if (joint === 'knee') {
    if (angle > 160) return { status: 'warn', msg: 'Baja mas las caderas' };
    if (angle < 70) return { status: 'warn', msg: 'Muy profundo, cuidado' };
    if (angle <= 100) return { status: 'good', msg: 'Buena profundidad' };
    return { status: 'info', msg: 'Segui bajando' };
  }

  if (joint === 'elbow') {
    if (angle > 160) return { status: 'good', msg: 'Brazo extendido' };
    if (angle < 60) return { status: 'good', msg: 'Curl completo' };
    if (angle <= 100) return { status: 'info', msg: 'Continuar movimiento' };
    return { status: 'info', msg: 'Flexiona un poco mas' };
  }

  return { status: 'info', msg: `${angle} grados` };
}

function statusColor(status) {
  if (status === 'good') return 'var(--success)';
  if (status === 'warn') return '#f59e0b';
  if (status === 'idle') return 'var(--text-muted)';
  return 'var(--blue-bright)';
}

export default function PoseFeedback({ label, joint, angle }) {
  const { status, msg } = getFeedback(joint, angle);
  const color = statusColor(status);

  return (
    <div className="pose-feedback-card" style={{ borderColor: `${color}55` }}>
      <span className="pose-feedback-label">{label}</span>
      <span className="pose-feedback-angle" style={{ color }}>
        {angle != null ? `${angle}°` : '-'}
      </span>
      <span className="pose-feedback-msg" style={{ color }}>
        {msg}
      </span>
    </div>
  );
}
