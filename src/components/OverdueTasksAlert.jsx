import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { fetchTasks, clearOverdueAlert } from '../redux/slices/taskSlice';

const STORAGE_KEY = 'faytekAI_overdueShown';

export default function OverdueTasksAlert() {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const overdueAlerts = useSelector((s) => s.task.overdueAlerts);
  const isLoading = useSelector((s) => s.task.isLoading);
  const shownRef = useRef(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    if (isLoading || overdueAlerts.length === 0 || shownRef.current) return;

    // Vérifier si déjà montré dans cette session de navigateur
    const sessionShown = sessionStorage.getItem(STORAGE_KEY);
    if (sessionShown) return;

    shownRef.current = true;
    sessionStorage.setItem(STORAGE_KEY, '1');

    // Max 2 alertes pour ne pas spammer
    overdueAlerts.slice(0, 2).forEach((task) => {
      const key = enqueueSnackbar(
        `⏰ "${task.titre || task.title}" — deadline dépassée`,
        {
          variant: 'warning',
          autoHideDuration: 5000,
          onClick: () => {
            closeSnackbar(key);
            dispatch(clearOverdueAlert(task._id));
          },
        }
      );
    });

    if (overdueAlerts.length > 2) {
      enqueueSnackbar(
        `+ ${overdueAlerts.length - 2} tâche(s) en retard — voir l'icône 🔔`,
        { variant: 'info', autoHideDuration: 5000 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return null;
}
