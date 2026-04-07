import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { fetchTasks, clearOverdueAlert } from '../redux/slices/taskSlice';

/**
 * Composant invisible — vérifie les tâches avec deadline dépassée
 * et affiche une snackbar in-app au chargement du dashboard.
 * Se monte une seule fois dans DashboardLayout.
 */
export default function OverdueTasksAlert() {
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const overdueAlerts = useSelector((s) => s.task.overdueAlerts);
  const isLoading = useSelector((s) => s.task.isLoading);

  // Charger les tâches au montage du dashboard
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Afficher les alertes quand la liste est chargée
  useEffect(() => {
    if (isLoading || overdueAlerts.length === 0) return;

    // Afficher max 3 alertes pour ne pas spammer
    const toShow = overdueAlerts.slice(0, 3);

    toShow.forEach((task) => {
      const key = enqueueSnackbar(
        `⏰ Deadline dépassée : "${task.titre}"`,
        {
          variant: 'warning',
          persist: false,
          autoHideDuration: 6000,
          onClick: () => {
            closeSnackbar(key);
            dispatch(clearOverdueAlert(task._id));
          },
        }
      );
    });

    if (overdueAlerts.length > 3) {
      enqueueSnackbar(
        `+ ${overdueAlerts.length - 3} autre(s) tâche(s) en retard`,
        { variant: 'warning', autoHideDuration: 6000 }
      );
    }
    // Ne déclencher qu'une seule fois
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return null; // Pas de rendu visible
}
