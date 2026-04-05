const path = (root, sub) => `${root}${sub}`;
const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

export const PATH_AUTH = { root: ROOTS_AUTH, login: path(ROOTS_AUTH, '/login') };

export const PATH_DASHBOARD = {
  root: path(ROOTS_DASHBOARD, '/home'),
  home: path(ROOTS_DASHBOARD, '/home'),
  tasks: {
    root: path(ROOTS_DASHBOARD, '/tasks/list'),
    list: path(ROOTS_DASHBOARD, '/tasks/list'),
    board: path(ROOTS_DASHBOARD, '/tasks/board'),
    timeline: path(ROOTS_DASHBOARD, '/tasks/timeline'),
    calendar: path(ROOTS_DASHBOARD, '/tasks/calendar'),
    new: path(ROOTS_DASHBOARD, '/tasks/new'),
    edit: (id) => path(ROOTS_DASHBOARD, `/tasks/${id}/edit`),
    view: (id) => path(ROOTS_DASHBOARD, `/tasks/${id}`),
  },
  projects: {
    root: path(ROOTS_DASHBOARD, '/projects/list'),
    list: path(ROOTS_DASHBOARD, '/projects/list'),
    kanban: (id) => path(ROOTS_DASHBOARD, `/projects/${id}/kanban`),
    gantt: (id) => path(ROOTS_DASHBOARD, `/projects/${id}/gantt`),
    new: path(ROOTS_DASHBOARD, '/projects/new'),
    view: (id) => path(ROOTS_DASHBOARD, `/projects/${id}`),
  },
  calendar: { root: path(ROOTS_DASHBOARD, '/calendar') },
  emails: { root: path(ROOTS_DASHBOARD, '/emails'), view: (id) => path(ROOTS_DASHBOARD, `/emails/${id}`) },
  expenses: {
    root: path(ROOTS_DASHBOARD, '/expenses/list'),
    list: path(ROOTS_DASHBOARD, '/expenses/list'),
    new: path(ROOTS_DASHBOARD, '/expenses/new'),
    edit: (id) => path(ROOTS_DASHBOARD, `/expenses/${id}/edit`),
  },
  ideas: {
    root: path(ROOTS_DASHBOARD, '/ideas/list'),
    list: path(ROOTS_DASHBOARD, '/ideas/list'),
    new: path(ROOTS_DASHBOARD, '/ideas/new'),
    view: (id) => path(ROOTS_DASHBOARD, `/ideas/${id}`),
  },
  crm: {
    root: path(ROOTS_DASHBOARD, '/crm/contacts'),
    contacts: path(ROOTS_DASHBOARD, '/crm/contacts'),
    interactions: path(ROOTS_DASHBOARD, '/crm/interactions'),
    view: (id) => path(ROOTS_DASHBOARD, `/crm/contacts/${id}`),
  },
  reports: { root: path(ROOTS_DASHBOARD, '/reports') },
  focus: { root: path(ROOTS_DASHBOARD, '/focus') },
  missionControl: { root: path(ROOTS_DASHBOARD, '/mission-control') },
  office: { root: path(ROOTS_DASHBOARD, '/office') },
  settings: { root: path(ROOTS_DASHBOARD, '/settings'), security: path(ROOTS_DASHBOARD, '/settings/security') },
};
