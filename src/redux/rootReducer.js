import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import taskReducer from './slices/taskSlice';
import projectReducer from './slices/projectSlice';
import expenseReducer from './slices/expenseSlice';
import ideaReducer from './slices/ideaSlice';
import crmReducer from './slices/crmSlice';
import calendarReducer from './slices/calendarSlice';
import notificationReducer from './slices/notificationSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  task: taskReducer,
  project: projectReducer,
  expense: expenseReducer,
  idea: ideaReducer,
  crm: crmReducer,
  calendar: calendarReducer,
  notification: notificationReducer,
});

export default rootReducer;
