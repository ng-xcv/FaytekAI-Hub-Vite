import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea, Stack, Chip, Button,
  LinearProgress, Avatar, AvatarGroup, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { fetchProjects, createProject } from '../../redux/slices/projectSlice';

const STATUS_CONFIG = {
  actif:     { label: 'Actif',     color: 'success' },
  en_pause:  { label: 'En pause',  color: 'warning' },
  termine:   { label: 'Terminé',   color: 'info'    },
  archive:   { label: 'Archivé',   color: 'error'   },
};

function ProjectFormDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { nom: '', description: '', statut: 'actif', couleur: '#4f46e5' },
  });

  useEffect(() => { if (open) reset(); }, [open, reset]);

  const onSubmit = async (formData) => {
    await dispatch(createProject(formData));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nouveau Projet</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField {...register('nom')} label="Nom du projet" fullWidth required autoFocus />
            <TextField {...register('description')} label="Description" fullWidth multiline rows={3} />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Controller
                  name="statut"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Statut">
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                        <MenuItem key={v} value={v}>{c.label}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <TextField {...register('couleur')} label="Couleur" type="color" fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>
            Créer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function ProjectList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: projects, isLoading } = useSelector((s) => s.project);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects({}));
  }, [dispatch]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Projets</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouveau projet
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Icon icon="eva:folder-outline" width={56} style={{ opacity: 0.3 }} />
          <Typography sx={{ color: 'text.secondary', mt: 2 }}>Aucun projet</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((projet) => {
            const cfg = STATUS_CONFIG[projet.statut] || { label: projet.statut || 'actif', color: 'default' };
            const progression = projet.progression || 0;
            const proprietaire = projet.proprietaire;
            const nomProprietaire = proprietaire
              ? `${proprietaire.prenom || ''} ${proprietaire.nom || ''}`.trim() || proprietaire.email
              : null;

            return (
              <Grid key={projet._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/dashboard/projects/${projet._id}`)}
                    sx={{ height: '100%', borderRadius: 2 }}
                  >
                    <CardContent sx={{ height: '100%' }}>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                          <Box
                            sx={{
                              width: 44, height: 44, borderRadius: 1.5,
                              bgcolor: projet.couleur ? alpha(projet.couleur, 0.18) : (t) => alpha('#6366f1', 0.12),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Icon icon="eva:folder-fill" width={22} color={projet.couleur || undefined} />
                          </Box>
                          <Chip label={cfg.label} size="small" color={cfg.color} sx={{ height: 22, fontSize: 11 }} />
                        </Stack>

                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                            {projet.nom}
                          </Typography>
                          {projet.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {projet.description}
                            </Typography>
                          )}
                        </Box>

                        {progression > 0 && (
                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Progression</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{progression}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={progression}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: (t) => alpha('#6366f1', 0.12),
                              }}
                            />
                          </Box>
                        )}

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          {nomProprietaire && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {nomProprietaire}
                            </Typography>
                          )}
                          {projet.membres && projet.membres.length > 0 && (
                            <AvatarGroup
                              max={3}
                              sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11 } }}
                            >
                              {projet.membres.map((m, i) => {
                                const u = m.user || m;
                                const label = u?.prenom || u?.nom || u?.email || (typeof u === 'string' ? u : '?');
                                return (
                                  <Avatar key={i} alt={label} sx={{ width: 24, height: 24 }}>
                                    {label[0]?.toUpperCase()}
                                  </Avatar>
                                );
                              })}
                            </AvatarGroup>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <ProjectFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </motion.div>
  );
}
