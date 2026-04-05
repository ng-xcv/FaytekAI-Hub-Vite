import { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';
import DashboardLayout from '../layouts/dashboard';
import LoadingScreen from '../components/LoadingScreen';

const Loadable = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const DashboardHome = Loadable(lazy(() => import('../pages/dashboard/DashboardHome')));
const TaskList = Loadable(lazy(() => import('../pages/tasks/TaskList')));
const TaskBoard = Loadable(lazy(() => import('../pages/tasks/TaskBoard')));
const TaskTimeline = Loadable(lazy(() => import('../pages/tasks/TaskTimeline')));
const TaskCalendar = Loadable(lazy(() => import('../pages/tasks/TaskCalendar')));
const ProjectList = Loadable(lazy(() => import('../pages/projects/ProjectList')));
const ProjectDetail = Loadable(lazy(() => import('../pages/projects/ProjectDetail')));
const CalendarPage = Loadable(lazy(() => import('../pages/calendar/CalendarPage')));
const EmailsInbox = Loadable(lazy(() => import('../pages/emails/EmailsInbox')));
const ExpenseList = Loadable(lazy(() => import('../pages/expenses/ExpenseList')));
const ExpenseNewEdit = Loadable(lazy(() => import('../pages/expenses/ExpenseNewEdit')));
const IdeaList = Loadable(lazy(() => import('../pages/ideas/IdeaList')));
const IdeaDetail = Loadable(lazy(() => import('../pages/ideas/IdeaDetail')));
const CrmContacts = Loadable(lazy(() => import('../pages/crm/CrmContacts')));
const CrmInteractions = Loadable(lazy(() => import('../pages/crm/CrmInteractions')));
const FocusMode = Loadable(lazy(() => import('../pages/focus/FocusMode')));
const MissionControl = Loadable(lazy(() => import('../pages/mission-control/MissionControl')));
const Memory = Loadable(lazy(() => import('../pages/memory/Memory')));
const Brainstorming = Loadable(lazy(() => import('../pages/brainstorming/Brainstorming')));
const Office = Loadable(lazy(() => import('../pages/office/Office')));
const Settings = Loadable(lazy(() => import('../pages/settings/Settings')));
const Page404 = Loadable(lazy(() => import('../pages/Page404')));

export default function Router() {
  return useRoutes([
    { path: 'auth', children: [{ path: 'login', element: <GuestGuard><Login /></GuestGuard> }] },
    {
      path: 'dashboard',
      element: <AuthGuard><DashboardLayout /></AuthGuard>,
      children: [
        { index: true, element: <Navigate to="/dashboard/home" replace /> },
        { path: 'home', element: <DashboardHome /> },
        { path: 'tasks', children: [
          { index: true, element: <Navigate to="/dashboard/tasks/list" replace /> },
          { path: 'list', element: <TaskList /> },
          { path: 'board', element: <TaskBoard /> },
          { path: 'timeline', element: <TaskTimeline /> },
          { path: 'calendar', element: <TaskCalendar /> },
        ]},
        { path: 'projects', children: [
          { index: true, element: <Navigate to="/dashboard/projects/list" replace /> },
          { path: 'list', element: <ProjectList /> },
          { path: ':id', element: <ProjectDetail /> },
        ]},
        { path: 'calendar', element: <CalendarPage /> },
        { path: 'emails', element: <EmailsInbox /> },
        { path: 'expenses', children: [
          { index: true, element: <Navigate to="/dashboard/expenses/list" replace /> },
          { path: 'list', element: <ExpenseList /> },
          { path: 'new', element: <ExpenseNewEdit /> },
          { path: ':id/edit', element: <ExpenseNewEdit /> },
        ]},
        { path: 'ideas', children: [
          { index: true, element: <Navigate to="/dashboard/ideas/list" replace /> },
          { path: 'list', element: <IdeaList /> },
          { path: ':id', element: <IdeaDetail /> },
        ]},
        { path: 'crm', children: [
          { index: true, element: <Navigate to="/dashboard/crm/contacts" replace /> },
          { path: 'contacts', element: <CrmContacts /> },
          { path: 'interactions', element: <CrmInteractions /> },
        ]},
        { path: 'focus', element: <FocusMode /> },
        { path: 'mission-control', element: <MissionControl /> },
        { path: 'memory', element: <Memory /> },
        { path: 'brainstorming', element: <Brainstorming /> },
        { path: 'office', element: <Office /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
    { path: '/', element: <Navigate to="/auth/login" replace /> },
    { path: '404', element: <Page404 /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
