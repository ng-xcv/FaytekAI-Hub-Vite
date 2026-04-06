import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Stack, Card, CardContent, Button, Chip, CircularProgress,
  LinearProgress, Divider, IconButton, Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import { updateIdea, deleteIdea } from '../../redux/slices/ideaSlice';

const STATUT_CONFIG = {
  brute: { label: 'Brute', color: 'warning', emoji: '💡' },
  en_brainstorm: { label: 'Brainstorm en cours', color: 'info', emoji: '🧠' },
  brainstormee: { label: 'Analysée', color: 'primary', emoji: '📋' },
  actionnee: { label: 'Actionnée', color: 'success', emoji: '✅' },
  archivee: { label: 'Archivée', color: 'default', emoji: '📦' },
};

const PROGRESS_STEPS = { business: 25, market: 50, architecture: 75, development: 90, synthese: 95, terminee: 100 };

export default function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brainstorming, setBrainstorming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/api/ideas/${id}`)
      .then(({ data }) => setIdea(data.idea || data))
      .catch(() => setError('Impossible de charger l\'idée'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBrainstorm = async () => {
    setBrainstorming(true);
    try {
      const { data } = await axiosInstance.post(`/api/ideas/${id}/brainstorm`);
      setIdea(data.idea || data);
    } catch (e) {
      setError('Erreur lors du brainstorm');
    } finally {
      setBrainstorming(false);
    }
  };

  const handleArchive = async () => {
    try {
      await axiosInstance.post(`/api/ideas/${id}/archive`);
      navigate('/dashboard/ideas/list');
    } catch {
      setError('Erreur lors de l\'archivage');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette idée ?')) {
      await dispatch(deleteIdea(id));
      navigate('/dashboard/ideas/list');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  if (!idea) return <Box sx={{ textAlign: 'center', py: 8 }}><Typography>Idée introuvable</Typography><Button onClick={() => navigate('/dashboard/ideas/list')} sx={{ mt: 2 }}>Retour</Button></Box>;

  const cfg = STATUT_CONFIG[idea.statut] || STATUT_CONFIG.brute;
  const progress = idea.brainstorm?.etapeCourante ? PROGRESS_STEPS[idea.brainstorm.etapeCourante] || 0 : 0;
  const actions = idea.actionsProposees || [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton size="small" onClick={() => navigate('/dashboard/ideas/list')}>
          <Icon icon="eva:arrow-back-fill" />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ideas</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-start' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <Typography fontSize={28}>{cfg.emoji}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{idea.titre}</Typography>
          </Stack>
          <Chip label={cfg.label} color={cfg.color} sx={{ mr: 1 }} />
          {(idea.tags || []).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mr: 0.5 }} />
          ))}
        </Box>
        <Stack direction="row" spacing={1} flexShrink={0}>
          {idea.statut === 'brute' && (
            <Button
              variant="contained"
              startIcon={brainstorming ? <CircularProgress size={16} color="inherit" /> : <Icon icon="eva:bulb-fill" />}
              onClick={handleBrainstorm}
              disabled={brainstorming}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              {brainstorming ? 'Brainstorm...' : 'Lancer Brainstorm'}
            </Button>
          )}
          <IconButton onClick={handleArchive} title="Archiver"><Icon icon="eva:archive-fill" /></IconButton>
          <IconButton color="error" onClick={handleDelete} title="Supprimer"><Icon icon="eva:trash-2-fill" /></IconButton>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        {/* Description */}
        {idea.descriptionBrute && (
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{idea.descriptionBrute}</Typography>
            </CardContent>
          </Card>
        )}

        {/* Brainstorm Progress */}
        {idea.statut === 'en_brainstorm' && (
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>🧠 Brainstorm en cours</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{progress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Étape: {idea.brainstorm?.etapeCourante || 'démarrage'}</Typography>
            </CardContent>
          </Card>
        )}

        {/* Brainstorm Results */}
        {idea.brainstorm && (idea.brainstorm.businessSummary || idea.brainstorm.marketSummary || idea.brainstorm.syntheseFinale) && (
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Résultats du Brainstorm</Typography>
              <Stack spacing={2}>
                {idea.brainstorm.businessSummary && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>💼 Business</Typography>
                    <Typography variant="body2">{idea.brainstorm.businessSummary}</Typography>
                  </Box>
                )}
                {idea.brainstorm.marketSummary && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.main', mb: 0.5 }}>📊 Marché</Typography>
                    <Typography variant="body2">{idea.brainstorm.marketSummary}</Typography>
                  </Box>
                )}
                {idea.brainstorm.architectureSummary && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>🏗️ Architecture</Typography>
                    <Typography variant="body2">{idea.brainstorm.architectureSummary}</Typography>
                  </Box>
                )}
                {idea.brainstorm.syntheseFinale && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>🎯 Synthèse finale</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{idea.brainstorm.syntheseFinale}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Actions proposées ({actions.filter((a) => a.validee).length}/{actions.length})
              </Typography>
              <Stack spacing={1.5}>
                {actions.map((action, i) => (
                  <Stack key={i} direction="row" alignItems="flex-start" spacing={1.5} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: (t) => alpha(action.validee ? t.palette.success.main : t.palette.grey[500], 0.06) }}>
                    <Icon icon={action.validee ? 'eva:checkmark-circle-2-fill' : 'eva:radio-button-off-fill'} width={20} style={{ marginTop: 2, flexShrink: 0 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: action.validee ? 'line-through' : 'none' }}>
                        {action.titre}
                      </Typography>
                      {action.description && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{action.description}</Typography>}
                    </Box>
                    {action.tempsEstime && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>~{action.tempsEstime}h</Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </motion.div>
  );
}
