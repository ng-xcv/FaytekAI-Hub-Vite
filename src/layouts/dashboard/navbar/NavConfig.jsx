import { Icon } from '@iconify/react';
import { PATH_DASHBOARD } from '../../../routes/paths';

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const ICONS = {
  dashboard: getIcon('eva:grid-fill'),
  tasks: getIcon('eva:checkmark-square-2-fill'),
  projects: getIcon('eva:folder-fill'),
  calendar: getIcon('eva:calendar-fill'),
  emails: getIcon('eva:email-fill'),
  expenses: getIcon('eva:credit-card-fill'),
  ideas: getIcon('eva:bulb-fill'),
  crm: getIcon('eva:people-fill'),
  reports: getIcon('eva:bar-chart-2-fill'),
  focus: getIcon('eva:clock-fill'),
  missionControl: getIcon('eva:settings-2-fill'),
  office: getIcon('eva:home-fill'),
  settings: getIcon('eva:settings-fill'),
};

const navConfig = [
  { subheader: 'Principal', items: [{ title: 'Tableau de bord', path: PATH_DASHBOARD.home, icon: ICONS.dashboard }] },
  {
    subheader: 'Productivité',
    items: [
      { title: 'Tâches', path: PATH_DASHBOARD.tasks.root, icon: ICONS.tasks, children: [
        { title: 'Liste', path: PATH_DASHBOARD.tasks.list },
        { title: 'Board', path: PATH_DASHBOARD.tasks.board },
        { title: 'Timeline', path: PATH_DASHBOARD.tasks.timeline },
        { title: 'Calendrier', path: PATH_DASHBOARD.tasks.calendar },
      ]},
      { title: 'Projets', path: PATH_DASHBOARD.projects.root, icon: ICONS.projects },
      { title: 'Calendrier', path: PATH_DASHBOARD.calendar.root, icon: ICONS.calendar },
      { title: 'Emails', path: PATH_DASHBOARD.emails.root, icon: ICONS.emails },
      { title: 'Mode Focus', path: PATH_DASHBOARD.focus.root, icon: ICONS.focus },
    ],
  },
  {
    subheader: 'Business',
    items: [
      { title: 'Dépenses', path: PATH_DASHBOARD.expenses.root, icon: ICONS.expenses },
      { title: 'Ideas & BMAD', path: PATH_DASHBOARD.ideas.root, icon: ICONS.ideas },
      { title: 'CRM', path: PATH_DASHBOARD.crm.root, icon: ICONS.crm },
      { title: 'Rapports', path: PATH_DASHBOARD.reports.root, icon: ICONS.reports },
    ],
  },
  {
    subheader: 'Système',
    items: [
      { title: 'Bureau Digital', path: PATH_DASHBOARD.office.root, icon: ICONS.office },
      { title: 'Mission Control', path: PATH_DASHBOARD.missionControl.root, icon: ICONS.missionControl },
      { title: 'Paramètres', path: PATH_DASHBOARD.settings.root, icon: ICONS.settings },
    ],
  },
];

export default navConfig;
