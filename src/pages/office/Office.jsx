import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Avatar, Divider, LinearProgress, IconButton,
  Tooltip, Badge, Collapse,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../utils/axios';
import useBureauSocket from '../../hooks/useBureauSocket';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:  { label: 'Actif',    color: 'success', dot: '#4CAF50' },
  idle:    { label: 'En attente', color: 'warning', dot: '#FF9800' },
  offline: { label: 'Hors ligne', color: 'default', dot: '#9E9E9E' },
};

const SKILL_CATEGORY_ICONS = {
  technique: '⚙️', communication: '💬', analyse: '🔍',
  creation: '✨', gestion: '📊', autre: '🔧',
};

const MEM_TYPE_ICONS = {
  fact: '📌', preference: '⭐', project: '🗂️',
  lesson: '📚', instruction: '📋', recap: '📝',
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StatusDot({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  return (
    <Box sx={{
      width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0,
      boxShadow: status === 'active' ? `0 0 0 3px ${alpha(cfg.dot, 0.25)}` : 'none',
      transition: 'all 0.3s ease',
    }} />
  );
}

function SkillRow({ skill }) {
  const icon = SKILL_CATEGORY_ICONS[skill.categorie] || '🔧';
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{
      py: 0.75, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.25)}`,
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Typography fontSize={16}>{icon}</Typography>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{skill.nom}</Typography>
      </Box>
      <Chip
        label={skill.active ? 'ON' : 'OFF'}
        size="small"
        color={skill.active ? 'success' : 'default'}
        sx={{ height: 18, fontSize: 9, fontWeight: 700 }}
      />
    </Stack>
  );
}

function MemRow({ mem }) {
  const icon = MEM_TYPE_ICONS[mem.type] || '📝';
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{
      py: 1, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.2)}`,
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Typography fontSize={14} sx={{ mt: 0.1 }}>{icon}</Typography>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{mem.titre}</Typography>
        <Typography variant="caption" sx={{
          color: 'text.secondary', display: '-webkit-box',
          WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {mem.contenu}
        </Typography>
      </Box>
    </Stack>
  );
}

function AgentCard({ agent, onToggleStatus, expanded, onExpandToggle }) {
  const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline;
  const isActive = agent.status === 'active';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <Card elevation={0} sx={{
        border: (t) => `1px solid ${isActive ? alpha(cfg.dot, 0.4) : alpha(t.palette.divider, 0.4)}`,
        borderRadius: 2.5,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isActive ? `0 0 0 1px ${alpha(cfg.dot, 0.15)}` : 'none',
      }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={<StatusDot status={agent.status} />}
            >
              <Avatar sx={{
                width: 44, height: 44, fontSize: 22,
                bgcolor: agent.avatarColor || 'primary.main',
              }}>
                {agent.avatar || agent.name?.[0] || '🤖'}
              </Avatar>
            </Badge>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                {agent.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {agent.role || 'Agent IA'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title={isActive ? 'Désactiver' : 'Activer'}>
                <IconButton
                  size="small"
                  onClick={() => onToggleStatus(agent.agentId, isActive ? 'idle' : 'active')}
                  sx={{
                    color: isActive ? 'success.main' : 'text.disabled',
                    '&:hover': { bgcolor: isActive ? alpha('#4CAF50', 0.1) : alpha('#9E9E9E', 0.1) },
                  }}
                >
                  <Icon icon={isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off-outline'} width={22} />
                </IconButton>
              </Tooltip>

              <Tooltip title={expanded ? 'Réduire' : 'Détails'}>
                <IconButton size="small" onClick={onExpandToggle} sx={{ color: 'text.secondary' }}>
                  <Icon icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Tâche courante */}
          {agent.currentTask && (
            <Box sx={{ mt: 1.5, p: 1, borderRadius: 1.5, bgcolor: (t) => alpha(t.palette.info.main, 0.07) }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Icon icon="mdi:progress-clock" width={14} color="#2196F3" />
                <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 500 }} noWrap>
                  {agent.currentTask}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Détails expandables */}
          <Collapse in={expanded} timeout={200}>
            <Divider sx={{ my: 1.5 }} />

            {/* Skills */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Skills ({agent.skills?.length || 0})
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {agent.skills?.length > 0 ? (
                agent.skills.slice(0, 4).map((s) => <SkillRow key={s._id} skill={s} />)
              ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>Aucun skill</Typography>
              )}
              {agent.skills?.length > 4 && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  +{agent.skills.length - 4} autres...
                </Typography>
              )}
            </Box>

            {/* Mémoires */}
            {agent._memories?.length > 0 && (
              <>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mt: 1.5 }}>
                  Mémoire récente
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {agent._memories.slice(0, 3).map((m) => <MemRow key={m._id} mem={m} />)}
                </Box>
              </>
            )}

            {/* Stats */}
            {agent.stats && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Messages</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{agent.stats.messagesTotal || 0}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Tokens</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{agent.stats.tokensTotal || 0}</Typography>
                  </Box>
                  {agent.stats.lastActive && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Dernière activité</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {new Date(agent.stats.lastActive).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </>
            )}
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Office() {
  const { enqueueSnackbar } = useSnackbar();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [socketConnected, setSocketConnected] = useState(false);

  // Refs stables pour les callbacks Socket.IO
  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  // ─── Socket.IO : mise à jour temps réel ────────────────────────────────────
  const handleStatusChanged = useCallback((data) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.agentId === data.agentId
          ? { ...a, status: data.status, currentTask: data.currentTask }
          : a
      )
    );
  }, []);

  const handleTaskUpdated = useCallback((data) => {
    setAgents((prev) =>
      prev.map((a) => (a.agentId === data.agentId ? { ...a, currentTask: data.currentTask } : a))
    );
  }, []);

  const handleSkillUpdated = useCallback((data) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.agentId !== data.agentId) return a;
        let skills = [...(a.skills || [])];
        if (data.action === 'added') skills = [...skills, data.skill];
        if (data.action === 'updated') skills = skills.map((s) => (s._id === data.skill?._id ? data.skill : s));
        if (data.action === 'deleted') skills = skills.filter((s) => s._id !== data.skill?._id);
        return { ...a, skills };
      })
    );
  }, []);

  const { socket } = useBureauSocket({
    onStatusChanged: handleStatusChanged,
    onTaskUpdated: handleTaskUpdated,
    onSkillUpdated: handleSkillUpdated,
  });

  // Suivre l'état de connexion Socket.IO
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
  }, [socket]);

  // ─── Chargement initial ────────────────────────────────────────────────────
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await axiosInstance.get('/api/agents');
        const list = Array.isArray(res.data) ? res.data : [];

        // Charger les mémoires pour chaque agent en parallèle
        const withMemories = await Promise.all(
          list.map(async (agent) => {
            try {
              const memRes = await axiosInstance.get(`/api/agents/${agent.agentId}/memory?active=true`);
              const mems = Array.isArray(memRes.data) ? memRes.data : [];
              return { ...agent, _memories: mems.slice(0, 5) };
            } catch {
              return { ...agent, _memories: [] };
            }
          })
        );

        setAgents(withMemories);
      } catch (err) {
        console.error('[Office] Erreur chargement agents:', err.message);
        enqueueSnackbar('Erreur chargement des agents', { variant: 'error' });
      }
      setLoading(false);
    };

    loadAgents();
  }, [enqueueSnackbar]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleToggleStatus = useCallback(async (agentId, newStatus) => {
    try {
      await axiosInstance.patch(`/api/agents/${agentId}/status`, { status: newStatus });
      // La mise à jour viendra via Socket.IO, mais on update localement en fallback
      setAgents((prev) =>
        prev.map((a) => (a.agentId === agentId ? { ...a, status: newStatus } : a))
      );
      enqueueSnackbar(`Agent ${newStatus === 'active' ? 'activé' : 'désactivé'}`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Erreur mise à jour du statut', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const toggleExpand = useCallback((agentId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  }, []);

  // ─── Filtres ───────────────────────────────────────────────────────────────
  const filteredAgents = agents.filter((a) => filterStatus === 'all' || a.status === filterStatus);
  const counts = {
    total: agents.length,
    active: agents.filter((a) => a.status === 'active').length,
    idle: agents.filter((a) => a.status === 'idle').length,
    offline: agents.filter((a) => a.status === 'offline').length,
  };

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* En-tête */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Bureau Digital 🏢</Typography>
          <Tooltip title={socketConnected ? 'Temps réel actif' : 'Temps réel inactif'}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: socketConnected ? '#4CAF50' : '#9E9E9E',
              boxShadow: socketConnected ? '0 0 0 3px rgba(76,175,80,0.25)' : 'none',
              transition: 'all 0.3s',
            }} />
          </Tooltip>
        </Stack>

        {/* Filtres statut */}
        <Stack direction="row" spacing={1}>
          {[
            { key: 'all', label: `Tous (${counts.total})` },
            { key: 'active', label: `Actifs (${counts.active})` },
            { key: 'idle', label: `En attente (${counts.idle})` },
            { key: 'offline', label: `Hors ligne (${counts.offline})` },
          ].map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              size="small"
              onClick={() => setFilterStatus(f.key)}
              color={filterStatus === f.key ? 'primary' : 'default'}
              variant={filterStatus === f.key ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer', fontWeight: filterStatus === f.key ? 700 : 400 }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Stats rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Agents actifs', value: counts.active, total: counts.total, color: '#4CAF50', icon: 'mdi:robot' },
          { label: 'En attente', value: counts.idle, total: counts.total, color: '#FF9800', icon: 'mdi:timer-sand' },
          { label: 'Hors ligne', value: counts.offline, total: counts.total, color: '#9E9E9E', icon: 'mdi:robot-off' },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(s.color, 0.1) }}>
                    <Icon icon={s.icon} width={22} color={s.color} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={s.total > 0 ? (s.value / s.total) * 100 : 0}
                  sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: alpha(s.color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: s.color } }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grille agents */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredAgents.length === 0 ? (
        <Card elevation={0} sx={{ border: (t) => `1px dashed ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography fontSize={40}>🤖</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>Aucun agent</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {filterStatus === 'all' ? 'Aucun agent configuré.' : `Aucun agent avec le statut "${filterStatus}".`}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {filteredAgents.map((agent) => (
              <Grid key={agent._id || agent.agentId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <AgentCard
                  agent={agent}
                  onToggleStatus={handleToggleStatus}
                  expanded={expandedIds.has(agent.agentId)}
                  onExpandToggle={() => toggleExpand(agent.agentId)}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}
    </motion.div>
  );
}
