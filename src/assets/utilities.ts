export interface participant {
  name: string;
  timesCame: number[];
  timesWon: number[];
  age?: number;
}

export interface projectDetails {
  id: string;
  name: string;
  lastEdited: Date;
  label: Color;
}

export enum Color {
  red = 'red',
  orange = 'orange',
  yellow = 'yellow',
  green = 'green',
  blue = 'blue',
  black = 'black',
  white = 'white',
}

export interface projectDocument {
  info: {
    name: string;
    lastEdited: Date;
    created: Date;
    label: Color;
    term: number;
    resetWeek: number;
  };
  participants: participant[];
  users: {
    owner: string;
    editors: string[];
    viewers: string[];
  };
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years + ' year' + (years > 1 ? 's' : '') + ' ago';
  }
  if (days > 0) {
    return days + ' day' + (days > 1 ? 's' : '') + ' ago';
  }
  if (hours > 0) {
    return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
  }
  if (minutes > 0) {
    return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
  }
  if (seconds > 0) {
    return seconds + ' second' + (seconds > 1 ? 's' : '') + ' ago';
  }
  return 'just now';
}

export enum View {
  card = 'card',
  table = 'table',
}

export enum Tier {
  basic = 'basic',
  premium = 'premium',
  admin = 'admin',
}

export interface userDocument {
  email: string;
  projects: string[];
  tier: Tier;
}

export enum Filter {
  all = 'all',
  present = 'present',
  absent = 'absent',
  won = 'won',
  eligible = 'eligible',
}
