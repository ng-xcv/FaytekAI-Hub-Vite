import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Chip, Button,
  Avatar, LinearProgress, CircularProgress, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'success', dot: '🟢' },
  idle: { label: 'En veille', color: 'warning', dot: '🟡' },
  offline: { label: 'Hors ligne', color: 'default', dot: '⚫' },
};

function formatLastSeen(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

function AgentCard({ agent }) {
  const sc = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline;
  return (
    <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
          <Avatar sx={{ width: 44, height: 44, fontSize: 22, bgcolor: 'primary.main' }}>
            {agent.avatar || agent.nom?.[0] || '🤖'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{agent.nom || agent.name}</Typography>
              <Chip label={sc.label} size="small" color={sc.color} sx={{ height: 20, fontSize: 10 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{agent.role || agent.description}</Typography>
          </Box>
        </Stack>

        {agent.currentTask && (
          <Box sx={{ mb: 1.5, p: 1, borderRadius: 1, bgcolor: (t) => alpha(t.palette.primary.main, 0.06) }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Tâche en cours:</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>{agent.currentTask}</Typography>
          </Box>
        )}

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Dernière activité: {formatLastSeen(agent.lastSeenAt || agent.last_seen)}
          </Typography>
          {agent.totalTokens && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {agent.totalTokens > 1000 ? `${(agent.totalTokens / 1000).toFixed(1)}k` : agent.totalTokens} tokens
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MissionControl() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/api/mission-control/agents');
        setAgents(data.agents || data || []);
        const actData = await axiosInstance.get('/api/mission-control/activity').catch(() => ({ data: [] }));
        setActivity(actData.data || []);
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeCount = agents.filter((a) => a.status === 'active').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Mission Control 🚀</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Centre de contrôle des agents IA</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label={`${activeCount} actif${activeCount > 1 ? 's' : ''}`} color="success" />
          <Chip label={`${idleCount} en veille`} color="warning" variant="outlined" />
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Stack spacing={3}>
          {/* Agents Grid */}
          {agents.length === 0 ? (
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, textAlign: 'center', py: 8 }}>
              <Typography fontSize={48}>🤖</Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>Aucun agent configuré</Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {agents.map((agent) => (
                <Grid key={agent._id || agent.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <AgentCard agent={agent} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Activity feed */}
          <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Activité récente</Typography>
              {activity.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Aucune activité récente</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {activity.slice(0, 10).map((ev, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.75, flexShrink: 0 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{ev.message || ev.description}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatLastSeen(ev.timestamp || ev.createdAt)}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </motion.div>
  );
}
