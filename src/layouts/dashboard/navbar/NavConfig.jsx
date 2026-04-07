import { Icon } from '@iconify/react';
import { PATH_DASHBOARD } from '../../../routes/paths';

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const ICONS = {
  dashboard: getIcon('eva:grid-fill'),
  tasks: getIcon('eva:checkmark-square-2-fill'),
  projects: getIcon('eva:folder-fill'),
  focus: getIcon('eva:clock-fill'),
  emails: getIcon('eva:email-fill'),
  calendar: getIcon('eva:calendar-fill'),
  crm: getIcon('eva:people-fill'),
  expenses: getIcon('eva:credit-card-fill'),
  missionControl: getIcon('eva:settings-2-fill'),
  memory: getIcon('eva:layers-fill'),
  brainstorming: getIcon('eva:bulb-fill'),
  office: getIcon('eva:home-fill'),
  settings: getIcon('eva:settings-fill'),
  reports: getIcon('eva:bar-chart-2-fill'),
  ideas: getIcon('eva:smiling-face-fill'),
};

const navConfig = [
  {
    subheader: 'Vue d\'ensemble',
    items: [
      { title: 'Tableau de bord', path: PATH_DASHBOARD.home, icon: ICONS.dashboard },
    ],
  },
  {
    subheader: 'Travail',
    items: [
      {
        title: 'Tâches',
        path: PATH_DASHBOARD.tasks.root,
        icon: ICONS.tasks,
        children: [
          { title: 'Liste', path: PATH_DASHBOARD.tasks.list },
          { title: 'Kanban', path: PATH_DASHBOARD.tasks.board },
          { title: 'Timeline', path: PATH_DASHBOARD.tasks.timeline },
          { title: 'Calendrier', path: PATH_DASHBOARD.tasks.calendar },
        ],
      },
      { title: 'Projets', path: PATH_DASHBOARD.projects.root, icon: ICONS.projects },
      { title: 'Mode Focus', path: PATH_DASHBOARD.focus.root, icon: ICONS.focus },
    ],
  },
  {
    subheader: 'Communication',
    items: [
      { title: 'Emails', path: PATH_DASHBOARD.emails.root, icon: ICONS.emails },
      { title: 'Calendrier', path: PATH_DASHBOARD.calendar.root, icon: ICONS.calendar },
      { title: 'CRM', path: PATH_DASHBOARD.crm.root, icon: ICONS.crm },
    ],
  },
  {
    subheader: 'Finances',
    items: [
      { title: 'Dépenses', path: PATH_DASHBOARD.expenses.root, icon: ICONS.expenses },
      { title: 'Rapports', path: PATH_DASHBOARD.reports.root, icon: ICONS.reports },
      { title: 'Idées', path: PATH_DASHBOARD.ideas.root, icon: ICONS.ideas },
    ],
  },
  {
    subheader: 'AI',
    items: [
      { title: 'Mission Control', path: PATH_DASHBOARD.missionControl.root, icon: ICONS.missionControl },
      { title: 'Mémoire', path: PATH_DASHBOARD.memory.root, icon: ICONS.memory },
      { title: 'Brainstorming BMAD', path: PATH_DASHBOARD.brainstorming.root, icon: ICONS.brainstorming },
    ],
  },
  {
    subheader: 'Espace',
    items: [
      { title: 'Bureau Digital', path: PATH_DASHBOARD.office.root, icon: ICONS.office },
      { title: 'Paramètres', path: PATH_DASHBOARD.settings.root, icon: ICONS.settings },
    ],
  },
];

export default navConfig;
