import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Chip, Button,
  Avatar, CircularProgress, Divider, Collapse, Switch, Tooltip,
  FormControl, InputLabel, Select, MenuItem, IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'success', hex: '#22c55e' },
  idle: { label: 'En veille', color: 'warning', hex: '#f59e0b' },
  offline: { label: 'Hors ligne', color: 'default', hex: '#6b7280' },
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

function SkillsPanel({ agent }) {
  const [skills, setSkills] = useState(agent.skills || []);
  const [loading, setLoading] = useState(false);

  const toggleSkill = async (skillId, current) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/api/agents/${agent.agentId}/skills/${skillId}`, { active: !current });
      setSkills((prev) => prev.map((s) => s._id === skillId ? { ...s, active: !current } : s));
    } catch { /* silent */ }
    setLoading(false);
  };

  if (!skills.length) {
    return <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>Aucun skill configuré</Typography>;
  }

  return (
    <Stack spacing={0.5} sx={{ mt: 1 }}>
      {skills.map((skill) => (
        <Stack key={skill._id} direction="row" alignItems="center" justifyContent="space-between"
          sx={{ py: 0.5, px: 1, borderRadius: 1, bgcolor: (t) => alpha(t.palette.background.default, 0.6) }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{skill.nom}</Typography>
            {skill.categorie && (
              <Chip label={skill.categorie} size="small"
                sx={{ height: 16, fontSize: 10, mt: 0.25 }} />
            )}
          </Box>
          <Switch size="small" checked={skill.active} disabled={loading}
            onChange={() => toggleSkill(skill._id, skill.active)} />
        </Stack>
      ))}
    </Stack>
  );
}

function MemoryPanel({ agent }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    setLoading(true);
    axiosInstance.get(`/api/agents/${agent.agentId}/memory?active=true`)
      .then(({ data }) => setMemories(data || []))
      .catch(() => setMemories([]))
      .finally(() => { setLoading(false); setLoaded(true); });
  }, [agent.agentId, loaded]);

  if (loading) return <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>;
  if (!memories.length) return <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>Aucune mémoire active</Typography>;

  return (
    <Stack spacing={0.75} sx={{ mt: 1 }}>
      {memories.slice(0, 5).map((mem, i) => (
        <Box key={mem._id || i} sx={{ p: 1, borderRadius: 1, bgcolor: (t) => alpha(t.palette.primary.main, 0.05) }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
            {mem.type || 'Mémoire'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
            {typeof mem.contenu === 'string' ? mem.contenu : JSON.stringify(mem.contenu)}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function AgentCard({ agent, onStatusChange }) {
  const sc = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline;
  const [expanded, setExpanded] = useState(null); // 'skills' | 'memory' | null
  const [toggling, setToggling] = useState(false);

  const handleStatusToggle = async () => {
    setToggling(true);
    const newStatus = agent.status === 'active' ? 'idle' : 'active';
    try {
      await axiosInstance.patch(`/api/agents/${agent.agentId}/status`, { status: newStatus });
      onStatusChange(agent._id, newStatus);
    } catch { /* silent */ }
    setToggling(false);
  };

  const togglePanel = (panel) => setExpanded((prev) => prev === panel ? null : panel);

  return (
    <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
          <Avatar sx={{ width: 48, height: 48, fontSize: 24, bgcolor: agent.avatarColor || 'primary.main' }}>
            {agent.avatar || agent.name?.[0] || '🤖'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 0.5 }}>{agent.name}</Typography>
              <Chip
                label={sc.label}
                size="small"
                color={sc.color}
                sx={{ height: 20, fontSize: 10 }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{agent.role}</Typography>
            {agent.model && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
                {agent.model}
              </Typography>
            )}
          </Box>
          <Tooltip title={agent.status === 'active' ? 'Mettre en veille' : 'Activer'}>
            <Switch
              size="small"
              checked={agent.status === 'active'}
              disabled={toggling || agent.status === 'offline'}
              onChange={handleStatusToggle}
            />
          </Tooltip>
        </Stack>

        {/* Tâche courante */}
        {agent.currentTask && (
          <Box sx={{ mb: 1.5, p: 1, borderRadius: 1, bgcolor: (t) => alpha(t.palette.primary.main, 0.06) }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Tâche en cours :</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, fontSize: 12 }}>
              {agent.currentTask}
            </Typography>
          </Box>
        )}

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Skills</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{agent.skills?.length || 0}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Messages</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{agent.stats?.messagesTotal || 0}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Tokens</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {agent.stats?.tokensTotal > 1000
                ? `${(agent.stats.tokensTotal / 1000).toFixed(1)}k`
                : agent.stats?.tokensTotal || 0}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          Dernière activité : {formatLastSeen(agent.stats?.lastActive)}
        </Typography>

        <Divider sx={{ mb: 1 }} />

        {/* Actions expand */}
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant={expanded === 'skills' ? 'contained' : 'outlined'}
            onClick={() => togglePanel('skills')}
            startIcon={<Icon icon="eva:star-fill" width={14} />}
            sx={{ fontSize: 11, borderRadius: 1 }}
          >
            Skills ({agent.skills?.length || 0})
          </Button>
          <Button
            size="small"
            variant={expanded === 'memory' ? 'contained' : 'outlined'}
            onClick={() => togglePanel('memory')}
            startIcon={<Icon icon="eva:hard-drive-fill" width={14} />}
            sx={{ fontSize: 11, borderRadius: 1 }}
          >
            Mémoire
          </Button>
        </Stack>

        {/* Skills panel */}
        <Collapse in={expanded === 'skills'}>
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Skills
            </Typography>
            <SkillsPanel agent={agent} />
          </Box>
        </Collapse>

        {/* Memory panel */}
        <Collapse in={expanded === 'memory'}>
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Mémoire récente
            </Typography>
            <MemoryPanel agent={agent} />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function MissionControl() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadAgents = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/agents');
      setAgents(data || []);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
    // Polling toutes les 30s
    const interval = setInterval(loadAgents, 30000);
    return () => clearInterval(interval);
  }, [loadAgents]);

  const handleStatusChange = (id, newStatus) => {
    setAgents((prev) => prev.map((a) => a._id === id ? { ...a, status: newStatus } : a));
  };

  const filtered = filter === 'all' ? agents : agents.filter((a) => a.status === filter);
  const activeCount = agents.filter((a) => a.status === 'active').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;
  const offlineCount = agents.filter((a) => a.status === 'offline').length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Mission Control 🚀</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Centre de contrôle des agents IA</Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Icon icon="eva:refresh-fill" width={16} />}
          onClick={loadAgents}
          sx={{ borderRadius: 1.5, fontWeight: 600 }}
        >
          Actualiser
        </Button>
      </Stack>

      {/* Stats globales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total agents', value: agents.length, color: 'primary.main', icon: 'eva:people-fill' },
          { label: 'Actifs', value: activeCount, color: '#22c55e', icon: 'eva:checkmark-circle-2-fill' },
          { label: 'En veille', value: idleCount, color: '#f59e0b', icon: 'eva:pause-circle-fill' },
          { label: 'Hors ligne', value: offlineCount, color: '#6b7280', icon: 'eva:minus-circle-fill' },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: (t) => alpha(stat.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={stat.icon} color={stat.color} width={22} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{stat.label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtre */}
      <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
        {[
          { value: 'all', label: 'Tous' },
          { value: 'active', label: 'Actifs' },
          { value: 'idle', label: 'En veille' },
          { value: 'offline', label: 'Hors ligne' },
        ].map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            clickable
            variant={filter === f.value ? 'filled' : 'outlined'}
            color={filter === f.value ? 'primary' : 'default'}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </Stack>

      {/* Liste agents */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, textAlign: 'center', py: 8 }}>
          <Typography fontSize={48}>🤖</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            {filter === 'all' ? 'Aucun agent configuré' : `Aucun agent ${STATUS_CONFIG[filter]?.label?.toLowerCase() || ''}`}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((agent) => (
            <Grid key={agent._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <AgentCard agent={agent} onStatusChange={handleStatusChange} />
            </Grid>
          ))}
        </Grid>
      )}
    </motion.div>
  );
}
