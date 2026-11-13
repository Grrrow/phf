// src/utils/events.ts

export interface EventItem {
  _uid?: string;
  component: string;
  title: string;
  title__i18n__es?: string;
  subtitle?: string;
  subtitle__i18n__es?: string;
  date_label?: string;
  date_sublabel?: string;
  sort_date?: string;
  location_label?: string;
  location_label__i18n__es?: string;
  details_label?: string;
  details_label__i18n__es?: string;
  details_link?: {
    cached_url?: string;
    url?: string;
    linktype?: string;
  };
  status?: string;
  open_in_new_tab?: boolean;
}

export function getEventDate(item: any): Date | null {
  if (item.sort_date) {
    const d = new Date(item.sort_date.replace(' ', 'T'));
    if (!isNaN(d.getTime())) return d;
  }

  const sublabel = item.date_sublabel || '';
  const label = item.date_label || '';
  const yearMatch = sublabel.match(/\b(20\d\d)\b/);
  const year = yearMatch ? yearMatch[1] : '';

  if (year && label) {
    const months: Record<string, string> = {
      jan: '01', ene: '01',
      feb: '02',
      mar: '03',
      apr: '04', abr: '04',
      may: '05',
      jun: '06',
      jul: '07',
      aug: '08', ago: '08',
      sep: '09', set: '09',
      oct: '10',
      nov: '11',
      dec: '12', dic: '12'
    };

    const mMatch = label.match(/(jan|ene|feb|mar|apr|abr|may|jun|jul|aug|ago|sep|set|oct|nov|dec|dic)/i);
    const rangeMatch = label.match(/[–-]\s*([a-z]{3})?\s*(\d{1,2})/i);
    let month = '01';
    let day = '01';

    if (rangeMatch) {
      if (rangeMatch[1]) {
        month = months[rangeMatch[1].toLowerCase()] || '01';
      } else if (mMatch) {
        month = months[mMatch[1].toLowerCase()] || '01';
      }
      day = rangeMatch[2].padStart(2, '0');
    } else if (mMatch) {
      month = months[mMatch[1].toLowerCase()] || '01';
      const dMatch = label.match(/\b(\d{1,2})\b/);
      day = dMatch ? dMatch[1].padStart(2, '0') : '01';
    }

    const d = new Date(`${year}-${month}-${day}T23:59:59`);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export function isEventUpcoming(item: any): boolean {
  if (item.status === 'past') return false;
  const eventDate = getEventDate(item);
  if (!eventDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export const CURATED_PAST_EVENTS_DATA = [
  {
    titleEn: 'Closing Gala: Lied & Opera',
    titleEs: 'Gala de Clausura: Lied y Ópera',
    subtitleEn: 'Mar Morán & Pedro Halffter · Lied, opera and Poeta en Nueva York',
    subtitleEs: 'Mar Morán y Pedro Halffter · Lied, ópera y Poeta en Nueva York',
    dateLabel: 'Aug 22',
    dateSublabel: '2026 · 20:30',
    sortDate: '2026-08-22 20:30',
    locationEn: 'Iglesia de San Nicolás, Villafranca del Bierzo',
    locationEs: 'Iglesia de San Nicolás, Villafranca del Bierzo',
  },
  {
    titleEn: 'Pedro Halffter: Piano Recital',
    titleEs: 'Pedro Halffter: Recital de Piano',
    subtitleEn: 'Solo piano recital at Música en Villafranca Festival',
    subtitleEs: 'Recital a solo en el Festival Música en Villafranca',
    dateLabel: 'Aug 20',
    dateSublabel: '2026 · 20:30',
    sortDate: '2026-08-20 20:30',
    locationEn: 'Iglesia de San Nicolás, Villafranca del Bierzo',
    locationEs: 'Iglesia de San Nicolás, Villafranca del Bierzo',
  },
  {
    titleEn: 'Schubert: Schwanengesang',
    titleEs: 'Schubert: Schwanengesang',
    subtitleEn: "Schubert's final song cycle with tenor José Manuel Montero & Pedro Halffter",
    subtitleEs: 'Ciclo de lieder con el tenor José Manuel Montero y Pedro Halffter al piano',
    dateLabel: 'Aug 15',
    dateSublabel: '2026 · 20:30',
    sortDate: '2026-08-15 20:30',
    locationEn: 'Iglesia de San Nicolás, Villafranca del Bierzo',
    locationEs: 'Iglesia de San Nicolás, Villafranca del Bierzo',
  },
  {
    titleEn: 'Beethoven & Halffter',
    titleEs: 'Beethoven & Halffter',
    subtitleEn: "Solo recital pairing Beethoven sonatas with Halffter's Meditaciones",
    subtitleEs: 'Recital a solo con tres sonatas de Beethoven y Meditaciones de Halffter',
    dateLabel: 'Aug 07',
    dateSublabel: '2026 · 20:30',
    sortDate: '2026-08-07 20:30',
    locationEn: 'Iglesia de San Nicolás, Villafranca del Bierzo',
    locationEs: 'Iglesia de San Nicolás, Villafranca del Bierzo',
  },
  {
    titleEn: 'Prokofiev & Madrid Symphony Orchestra',
    titleEs: 'Prokófiev & Orquesta Sinfónica de Madrid',
    subtitleEn: 'Extraordinary symphonic concert at Auditorio Nacional de Música',
    subtitleEs: 'Concierto sinfónico extraordinario en el Auditorio Nacional de Música',
    dateLabel: 'May 16',
    dateSublabel: '2026 · 19:30',
    sortDate: '2026-05-16 19:30',
    locationEn: 'Auditorio Nacional de Música, Madrid',
    locationEs: 'Auditorio Nacional de Música, Madrid',
  },
  {
    titleEn: 'Wagner: Parsifal (Chorus & Orchestra)',
    titleEs: 'Wagner: Parsifal (Coro y Orquesta)',
    subtitleEn: "Pedro Halffter's symphonic-choral version for Ópera de Tenerife season finale",
    subtitleEs: 'Versión sinfónico-coral de Pedro Halffter para el cierre de temporada',
    dateLabel: 'Jun 25',
    dateSublabel: '2025 · 20:00',
    sortDate: '2025-06-25 20:00',
    locationEn: 'Auditorio de Tenerife Adán Martín',
    locationEs: 'Auditorio de Tenerife Adán Martín',
  },
  {
    titleEn: 'Bruckner: Symphony No. 7',
    titleEs: 'Bruckner: Sinfonía nº 7',
    subtitleEn: 'Musical direction leading the Madrid Symphony Orchestra',
    subtitleEs: 'Dirección al frente de la Orquesta Sinfónica de Madrid',
    dateLabel: 'Jun 13',
    dateSublabel: '2025 · 19:30',
    sortDate: '2025-06-13 19:30',
    locationEn: 'Auditorio Nacional de Música, Madrid',
    locationEs: 'Auditorio Nacional de Música, Madrid',
  },
  {
    titleEn: 'Klara (Opera by Pedro Halffter) — NY Premiere',
    titleEs: 'Klara (Ópera de Pedro Halffter) — Estreno en NY',
    subtitleEn: 'New York premiere presented by Opera Hispánica at National Sawdust',
    subtitleEs: 'Estreno neoyorquino presentado por Opera Hispánica en National Sawdust',
    dateLabel: 'Feb 28',
    dateSublabel: '2025 · 20:00',
    sortDate: '2025-02-28 20:00',
    locationEn: 'National Sawdust, Brooklyn, New York',
    locationEs: 'National Sawdust, Brooklyn, Nueva York',
  },
  {
    titleEn: 'Rossini: Il Barbiere di Siviglia',
    titleEs: 'Rossini: El Barbero de Sevilla',
    subtitleEn: 'Conducted at Opéra de Montréal with Orchestre Métropolitain',
    subtitleEs: 'Dirección musical en la Opéra de Montréal con la Orchestre Métropolitain',
    dateLabel: 'Sep 30',
    dateSublabel: '2024 · 19:30',
    sortDate: '2024-09-30 19:30',
    locationEn: 'Salle Wilfrid-Pelletier, Montréal',
    locationEs: 'Salle Wilfrid-Pelletier, Montreal',
  },
  {
    titleEn: "Penelope's Dream (Stage Premiere)",
    titleEs: "Penelope's Dream (Estreno Escénico)",
    subtitleEn: 'Dramatic and symphonic work by Pedro Halffter at Teatro Bretón',
    subtitleEs: 'Obra dramática y sinfónica de Pedro Halffter en el Teatro Bretón',
    dateLabel: 'May 16',
    dateSublabel: '2024 · 20:00',
    sortDate: '2024-05-16 20:00',
    locationEn: 'Teatro Bretón de los Herreros, Logroño',
    locationEs: 'Teatro Bretón de los Herreros, Logroño',
  }
];

export function getUpcomingEvents(items: any[]): any[] {
  return items
    .filter(item => isEventUpcoming(item))
    .sort((a, b) => {
      const da = getEventDate(a)?.getTime() || 0;
      const db = getEventDate(b)?.getTime() || 0;
      return da - db;
    });
}

export function getPastEvents(items: any[], limit = 10, isEs = false): any[] {
  const storyPastItems = items.filter(item => !isEventUpcoming(item));
  
  const seenDates = new Set<string>();
  const seenTitles = new Set<string>();
  const merged: any[] = [];

  function addEvent(ev: any) {
    const dateKey = ev.sort_date?.slice(0, 10) || '';
    const titleKey = (ev.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (dateKey && seenDates.has(dateKey)) return;
    if (titleKey && seenTitles.has(titleKey)) return;

    if (dateKey) seenDates.add(dateKey);
    if (titleKey) seenTitles.add(titleKey);
    merged.push(ev);
  }

  for (const item of storyPastItems) {
    addEvent({
      ...item,
      status: 'past',
      details_label: isEs ? 'Concierto Realizado' : 'Past Performance',
      title: (isEs && item.title__i18n__es) ? item.title__i18n__es : item.title,
      subtitle: (isEs && item.subtitle__i18n__es) ? item.subtitle__i18n__es : item.subtitle,
    });
  }

  for (const p of CURATED_PAST_EVENTS_DATA) {
    addEvent({
      component: 'event_highlight_item',
      title: isEs ? p.titleEs : p.titleEn,
      subtitle: isEs ? p.subtitleEs : p.subtitleEn,
      date_label: p.dateLabel,
      date_sublabel: p.dateSublabel,
      sort_date: p.sortDate,
      location_label: isEs ? p.locationEs : p.locationEn,
      details_label: isEs ? 'Concierto Realizado' : 'Past Performance',
      status: 'past'
    });
  }

  // Sort descending by date (most recent past event first)
  merged.sort((a, b) => {
    const da = getEventDate(a)?.getTime() || 0;
    const db = getEventDate(b)?.getTime() || 0;
    return db - da;
  });

  return merged.slice(0, limit);
}
