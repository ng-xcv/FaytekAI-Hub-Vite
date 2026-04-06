import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea, Stack, Chip, Button,
  TextField, InputAdornment, Select, MenuItem, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { fetchIdeas, createIdea } from '../../redux/slices/ideaSlice';

const STATUT_CONFIG = {
  brute: { label: 'Brute', color: 'warning', emoji: '💡' },
  en_brainstorm: { label: 'Brainstorm', color: 'info', emoji: '🧠' },
  brainstormee: { label: 'Analysée', color: 'primary', emoji: '📋' },
  actionnee: { label: 'Actionnée', color: 'success', emoji: '✅' },
  archivee: { label: 'Archivée', color: 'default', emoji: '📦' },
};

const PROGRESS_STEPS = { business: 25, market: 50, architecture: 75, development: 90, synthese: 95, terminee: 100 };

function IdeaCard({ idea, onClick }) {
  const cfg = STATUT_CONFIG[idea.statut] || STATUT_CONFIG.brute;
  const progress = idea.brainstorm?.etapeCourante ? PROGRESS_STEPS[idea.brainstorm.etapeCourante] || 0 : 0;
  const actionsCount = idea.actionsProposees?.length || 0;
  const actionsValidees = idea.actionsProposees?.filter((a) => a.validee).length || 0;

  return (
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
      <CardActionArea onClick={onClick} sx={{ height: '100%', borderRadius: 2 }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontSize={22}>{cfg.emoji}</Typography>
            <Chip label={cfg.label} size="small" color={cfg.color} sx={{ height: 22, fontSize: 11 }} />
          </Stack>

          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {idea.titre}
          </Typography>

          {idea.descriptionBrute && (
            <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {idea.descriptionBrute}
            </Typography>
          )}

          {idea.statut === 'en_brainstorm' && progress > 0 && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Progression</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{progress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
            </Box>
          )}

          {actionsCount > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {actionsValidees}/{actionsCount} actions
            </Typography>
          )}

          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 'auto' }}>
            {(idea.tags || []).slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
            ))}
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {new Date(idea.updatedAt || idea.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function IdeaFormDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { titre: '', descriptionBrute: '', workspace: 'bureau', tags: '' },
  });
  useEffect(() => { if (open) reset(); }, [open, reset]);
  const onSubmit = async (data) => {
    await dispatch(createIdea({ ...data, tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [], statut: 'brute', source: 'manual' }));
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nouvelle idée</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField {...register('titre')} label="Titre de l'idée" fullWidth required autoFocus />
            <TextField {...register('descriptionBrute')} label="Description" fullWidth multiline rows={3} />
            <TextField {...register('tags')} label="Tags (séparés par virgule)" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Créer</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function IdeaList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: ideas, isLoading } = useSelector((s) => s.idea);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchIdeas({}));
  }, [dispatch]);

  const filtered = ideas.filter((i) => {
    const matchSearch = !search || i.titre?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || i.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Ideas</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="eva:plus-fill" />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          Nouvelle idée
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Rechercher une idée..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="eva:search-fill" width={18} /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <Select size="small" value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">Tous les statuts</MenuItem>
          {Object.entries(STATUT_CONFIG).map(([v, c]) => (
            <MenuItem key={v} value={v}>{c.label}</MenuItem>
          ))}
        </Select>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography fontSize={48}>💡</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>Aucune idée trouvée</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((idea) => (
            <Grid key={idea._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <IdeaCard idea={idea} onClick={() => navigate(`/dashboard/ideas/${idea._id}`)} />
            </Grid>
          ))}
        </Grid>
      )}

      <IdeaFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </motion.div>
  );
}
