export const formatUptime = (uptime) => {
  const days = Math.floor(uptime / (3600 * 24));
  const hours = Math.floor((uptime % (3600 * 24)) / 3600);
  return days === 0 ? `${hours} horas` : `${days} dias e ${hours} horas`;
};

export const formatDate = (isoDateString) => {
  if (!isoDateString) return '';

  const isoDate = isoDateString.split('T')[0];
  const [year, month, day] = isoDate.split('-');

  return `${day}/${month}/${year}`;
};

export const getTempoDesdeInscricao = (dataIso) => {
  const dataInscricao = new Date(dataIso);
  const hoje = new Date();

  const diffMs = hoje - dataInscricao;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 1) return 'Enviou curriculo hoje';
  if (diffDias === 1) return 'Enviou curriculo há 1 dia';
  if (diffDias <= 30) return `Enviou curriculo há ${diffDias} dias`;

  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return 'Enviou curriculo há 1 mês';
  if (diffMeses < 12) return `Enviou curriculo há ${diffMeses} meses`;

  return 'há mais de um ano';
};

export const formatTelefone = (numero) => {
  if (!numero) return '';

  const limpo = numero.replace(/\D/g, '');

  if (limpo.length === 11) {
    const ddd = limpo.slice(0, 2);
    const parte1 = limpo.slice(2, 7);
    const parte2 = limpo.slice(7);
    return `(${ddd}) ${parte1}-${parte2}`;
  }

  return numero;
};

export const timeAgo = (isoString) => {
  const now = Math.floor(Date.now() / 1000);
  const timestamp = Math.floor(new Date(isoString).getTime() / 1000);
  const diff = now - timestamp;

  if (diff < 60) {
    return `agora`;
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `há ${minutes} min`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `há ${hours}h`;
  } else {
    const days = Math.floor(diff / 86400);
    return `há ${days} dia${days > 1 ? 's' : ''} `;
  }
};
