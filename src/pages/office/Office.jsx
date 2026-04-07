import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Drawer,
  Tabs,
  Tab,
  TextField,
  Switch,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../utils/axios';
import useBureauSocket from '../../hooks/useBureauSocket';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: { label: 'Actif', color: '#10B981', dot: '#10B981' },
  idle: { label: 'En veille', color: '#F59E0B', dot: '#F59E0B' },
  offline: { label: 'Hors ligne', color: '#6B7280', dot: '#6B7280' },
};

const MEMORY_ICONS = {
  instruction: '📌',
  objectif: '⭐',
  contexte: '🗂️',
  connaissance: '📚',
  tache: '📋',
  note: '📝',
};

const SKILL_CATEGORY_ICONS = {
  code: '⚙️',
  communication: '💬',
  recherche: '🔍',
  creation: '✨',
  analyse: '📊',
  autre: '🔧',
};

const MEMORY_TYPES = ['instruction', 'objectif', 'contexte', 'connaissance', 'tache', 'note'];
const SKILL_CATEGORIES = ['code', 'communication', 'recherche', 'creation', 'analyse', 'autre'];

// ─── PulseAnimation ────────────────────────────────────────────────────────────
const pulseKeyframes = `
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    80%, 100% { transform: scale(2.2); opacity: 0; }
  }
`;

// ─── Composant TabPanel ────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return value === index ? (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>{children}</Box>
  ) : null;
}

// ─── Composant AgentCard ───────────────────────────────────────────────────────
function AgentCard({ agent, onSelect, onStatusChange }) {
  const color = agent.avatarColor || '#6B7280';
  const statusCfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline;
  const isActive = agent.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
    >
      <style>{pulseKeyframes}</style>
      <Card
        onClick={() => onSelect(agent)}
        sx={{
          cursor: 'pointer',
          border: `2px solid ${isActive ? color : alpha(color, 0.3)}`,
          background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
          backdropFilter: 'blur(8px)',
          borderRadius: 3,
          transition: 'all 0.25s ease',
          '&:hover': {
            border: `2px solid ${color}`,
            boxShadow: `0 8px 32px ${alpha(color, 0.25)}`,
          },
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: statusCfg.color,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                bgcolor: statusCfg.color,
                animation: 'pulse-ring 1.5s ease-out infinite',
              },
            }}
          />
        )}

        <CardContent>
          {/* Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 1 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: statusCfg.color,
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  fontSize: 32,
                  bgcolor: alpha(color, 0.15),
                  border: `2px solid ${alpha(color, 0.4)}`,
                }}
              >
                {agent.avatar}
              </Avatar>
            </Badge>
          </Box>

          {/* Nom & Rôle */}
          <Typography variant="subtitle1" fontWeight={700} textAlign="center" noWrap>
            {agent.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block" noWrap sx={{ mb: 1.5 }}>
            {agent.role}
          </Typography>

          {/* Statut */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusCfg.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: statusCfg.color, fontWeight: 600 }}>
              {statusCfg.label}
            </Typography>
          </Box>

          {/* Tâche courante */}
          <Typography
            variant="caption"
            fontStyle="italic"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
              minHeight: 32,
            }}
          >
            {agent.currentTask || 'En attente...'}
          </Typography>

          {/* Compteurs */}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            ⚙️ {agent.skills?.length || 0} skills{' '}
            &nbsp;|&nbsp; 🧠 {agent._memories?.length || 0} mémoires
          </Typography>

          <Divider sx={{ mb: 1.5 }} />

          {/* Boutons d'action rapide */}
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Activer">
              <span style={{ flex: 1 }}>
                <Button
                  size="small"
                  variant={agent.status === 'active' ? 'contained' : 'outlined'}
                  color="success"
                  fullWidth
                  disabled={agent.status === 'active'}
                  onClick={() => onStatusChange(agent.agentId, 'active')}
                  sx={{ fontSize: '0.65rem', px: 0.5 }}
                >
                  Actif
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="En veille">
              <span style={{ flex: 1 }}>
                <Button
                  size="small"
                  variant={agent.status === 'idle' ? 'contained' : 'outlined'}
                  color="warning"
                  fullWidth
                  disabled={agent.status === 'idle'}
                  onClick={() => onStatusChange(agent.agentId, 'idle')}
                  sx={{ fontSize: '0.65rem', px: 0.5 }}
                >
                  Veille
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Arrêter">
              <span style={{ flex: 1 }}>
                <Button
                  size="small"
                  variant={agent.status === 'offline' ? 'contained' : 'outlined'}
                  color="inherit"
                  fullWidth
                  disabled={agent.status === 'offline'}
                  onClick={() => onStatusChange(agent.agentId, 'offline')}
                  sx={{ fontSize: '0.65rem', px: 0.5 }}
                >
                  Stop
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Composant Principal : Office ─────────────────────────────────────────────
export default function Office() {
  const { enqueueSnackbar } = useSnackbar();

  // État global
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [panelTab, setPanelTab] = useState(0);
  const [chatHistory, setChatHistory] = useState({});
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Panel — état local
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);
  const chatEndRef = useRef(null);

  // Skills dialog
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ nom: '', description: '', categorie: 'autre' });
  const [skillSaving, setSkillSaving] = useState(false);

  // Memory dialog
  const [memDialogOpen, setMemDialogOpen] = useState(false);
  const [newMem, setNewMem] = useState({ titre: '', contenu: '', type: 'note', importance: 3 });
  const [memSaving, setMemSaving] = useState(false);

  // ─── Chargement des agents ──────────────────────────────────────────────────
  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/agents');
      const list = Array.isArray(res.data) ? res.data : [];
      const withData = await Promise.all(
        list.map(async (agent) => {
          try {
            const memRes = await axiosInstance.get(`/api/agents/${agent.agentId}/memory?active=true`);
            return { ...agent, _memories: Array.isArray(memRes.data) ? memRes.data : [] };
          } catch {
            return { ...agent, _memories: [] };
          }
        })
      );
      setAgents(withData);
    } catch (err) {
      enqueueSnackbar('Erreur chargement agents', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Sync taskInput quand l'agent sélectionné change
  useEffect(() => {
    if (selectedAgent) {
      setTaskInput(selectedAgent.currentTask || '');
    }
  }, [selectedAgent?.agentId]);

  // Scroll chat vers le bas
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, selectedAgent]);

  // ─── Socket.IO ─────────────────────────────────────────────────────────────
  const handleStatusChanged = useCallback(({ agentId, status, currentTask }) => {
    setAgents((prev) =>
      prev.map((a) => (a.agentId === agentId ? { ...a, status, currentTask } : a))
    );
    setSelectedAgent((prev) =>
      prev?.agentId === agentId ? { ...prev, status, currentTask } : prev
    );
  }, []);

  const handleTaskUpdated = useCallback(({ agentId, currentTask }) => {
    setAgents((prev) =>
      prev.map((a) => (a.agentId === agentId ? { ...a, currentTask } : a))
    );
    setSelectedAgent((prev) =>
      prev?.agentId === agentId ? { ...prev, currentTask } : prev
    );
  }, []);

  const handleSkillUpdated = useCallback(({ agentId, skill, action }) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.agentId !== agentId) return a;
        let skills = [...(a.skills || [])];
        if (action === 'added') skills = [...skills, skill];
        else if (action === 'updated') skills = skills.map((s) => (s._id === skill._id ? skill : s));
        else if (action === 'deleted') skills = skills.filter((s) => s._id !== skill._id);
        return { ...a, skills };
      })
    );
  }, []);

  const { joinAgent } = useBureauSocket({
    onStatusChanged: handleStatusChanged,
    onTaskUpdated: handleTaskUpdated,
    onSkillUpdated: handleSkillUpdated,
    onConnect: () => setSocketConnected(true),
    onDisconnect: () => setSocketConnected(false),
  });

  // Rejoindre la room socket quand un agent est sélectionné
  useEffect(() => {
    if (selectedAgent && joinAgent) {
      joinAgent(selectedAgent.agentId);
    }
  }, [selectedAgent?.agentId, joinAgent]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleStatusChange = async (agentId, status) => {
    try {
      await axiosInstance.patch(`/api/agents/${agentId}/status`, { status });
      setAgents((prev) => prev.map((a) => (a.agentId === agentId ? { ...a, status } : a)));
      setSelectedAgent((prev) => (prev?.agentId === agentId ? { ...prev, status } : prev));
      enqueueSnackbar(`Statut mis à jour : ${STATUS_CONFIG[status]?.label}`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur mise à jour statut', { variant: 'error' });
    }
  };

  const handleAssignTask = async () => {
    if (!selectedAgent) return;
    try {
      setTaskSaving(true);
      await axiosInstance.patch(`/api/agents/${selectedAgent.agentId}/status`, {
        status: selectedAgent.status,
        currentTask: taskInput,
      });
      setAgents((prev) =>
        prev.map((a) =>
          a.agentId === selectedAgent.agentId ? { ...a, currentTask: taskInput } : a
        )
      );
      setSelectedAgent((prev) => ({ ...prev, currentTask: taskInput }));
      enqueueSnackbar('Tâche assignée', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur assignation tâche', { variant: 'error' });
    } finally {
      setTaskSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedAgent) return;
    const msg = chatInput.trim();
    try {
      setChatSending(true);
      await axiosInstance.post(`/api/agents/${selectedAgent.agentId}/message`, { message: msg });
      const newEntry = { role: 'user', content: msg, ts: new Date().toISOString() };
      setChatHistory((prev) => {
        const history = [...(prev[selectedAgent.agentId] || []), newEntry].slice(-10);
        return { ...prev, [selectedAgent.agentId]: history };
      });
      setChatInput('');
      enqueueSnackbar('Message envoyé', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur envoi message', { variant: 'error' });
    } finally {
      setChatSending(false);
    }
  };

  const handleToggleSkill = async (skill) => {
    if (!selectedAgent) return;
    try {
      await axiosInstance.put(`/api/agents/${selectedAgent.agentId}/skills/${skill._id}`, {
        active: !skill.active,
      });
      setAgents((prev) =>
        prev.map((a) => {
          if (a.agentId !== selectedAgent.agentId) return a;
          return {
            ...a,
            skills: a.skills.map((s) => (s._id === skill._id ? { ...s, active: !s.active } : s)),
          };
        })
      );
      setSelectedAgent((prev) => ({
        ...prev,
        skills: prev.skills.map((s) => (s._id === skill._id ? { ...s, active: !s.active } : s)),
      }));
    } catch {
      enqueueSnackbar('Erreur toggle skill', { variant: 'error' });
    }
  };

  const handleAddSkill = async () => {
    if (!selectedAgent || !newSkill.nom.trim()) return;
    try {
      setSkillSaving(true);
      const res = await axiosInstance.post(`/api/agents/${selectedAgent.agentId}/skills`, newSkill);
      const updated = res.data.data;
      setAgents((prev) =>
        prev.map((a) => (a.agentId === selectedAgent.agentId ? { ...a, skills: updated.skills } : a))
      );
      setSelectedAgent((prev) => ({ ...prev, skills: updated.skills }));
      setSkillDialogOpen(false);
      setNewSkill({ nom: '', description: '', categorie: 'autre' });
      enqueueSnackbar('Skill ajouté', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur ajout skill', { variant: 'error' });
    } finally {
      setSkillSaving(false);
    }
  };

  const handleDeleteMemory = async (memId) => {
    if (!selectedAgent) return;
    try {
      await axiosInstance.delete(`/api/agents/${selectedAgent.agentId}/memory/${memId}`);
      const updated = (selectedAgent._memories || []).filter((m) => m._id !== memId);
      setAgents((prev) =>
        prev.map((a) => (a.agentId === selectedAgent.agentId ? { ...a, _memories: updated } : a))
      );
      setSelectedAgent((prev) => ({ ...prev, _memories: updated }));
      enqueueSnackbar('Mémoire supprimée', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur suppression mémoire', { variant: 'error' });
    }
  };

  const handleAddMemory = async () => {
    if (!selectedAgent || !newMem.titre.trim()) return;
    try {
      setMemSaving(true);
      const res = await axiosInstance.post(`/api/agents/${selectedAgent.agentId}/memory`, newMem);
      const created = res.data.data;
      const updated = [...(selectedAgent._memories || []), created];
      setAgents((prev) =>
        prev.map((a) => (a.agentId === selectedAgent.agentId ? { ...a, _memories: updated } : a))
      );
      setSelectedAgent((prev) => ({ ...prev, _memories: updated }));
      setMemDialogOpen(false);
      setNewMem({ titre: '', contenu: '', type: 'note', importance: 3 });
      enqueueSnackbar('Mémoire ajoutée', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erreur ajout mémoire', { variant: 'error' });
    } finally {
      setMemSaving(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    try {
      setBroadcastLoading(true);
      const res = await axiosInstance.post('/api/agents/broadcast', { message: broadcastText });
      enqueueSnackbar(res.data.message || `Broadcast envoyé à ${res.data.count} agents`, {
        variant: 'success',
      });
      setBroadcastOpen(false);
      setBroadcastText('');
    } catch {
      enqueueSnackbar('Erreur broadcast', { variant: 'error' });
    } finally {
      setBroadcastLoading(false);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    active: agents.filter((a) => a.status === 'active').length,
    idle: agents.filter((a) => a.status === 'idle').length,
    offline: agents.filter((a) => a.status === 'offline').length,
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" fontWeight={800}>
            Bureau Digital 🏢
          </Typography>
          <Tooltip title={socketConnected ? 'Socket.IO connecté' : 'Socket.IO déconnecté'}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: socketConnected ? '#10B981' : '#6B7280',
                flexShrink: 0,
              }}
            />
          </Tooltip>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:bullhorn" />}
          onClick={() => setBroadcastOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          📢 Broadcast
        </Button>
      </Stack>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Actifs', count: stats.active, color: '#10B981' },
          { label: 'En veille', count: stats.idle, color: '#F59E0B' },
          { label: 'Hors ligne', count: stats.offline, color: '#6B7280' },
        ].map((s) => (
          <Box
            key={s.label}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: alpha(s.color, 0.1),
              border: `1px solid ${alpha(s.color, 0.3)}`,
              minWidth: 90,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>
              {s.count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {s.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* ── Grille agents ──────────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {agents.map((agent) => (
              <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={agent.agentId}>
                <AgentCard
                  agent={agent}
                  onSelect={(a) => {
                    setSelectedAgent(a);
                    setPanelTab(0);
                  }}
                  onStatusChange={handleStatusChange}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* ── Panel latéral ──────────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 420 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          },
        }}
      >
        {selectedAgent && (
          <>
            {/* Panel header */}
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(selectedAgent.avatarColor || '#6B7280', 0.08),
                borderBottom: `1px solid ${alpha(selectedAgent.avatarColor || '#6B7280', 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: 24,
                      bgcolor: alpha(selectedAgent.avatarColor || '#6B7280', 0.15),
                    }}
                  >
                    {selectedAgent.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {selectedAgent.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedAgent.role}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    label={STATUS_CONFIG[selectedAgent.status]?.label || selectedAgent.status}
                    size="small"
                    sx={{
                      bgcolor: alpha(STATUS_CONFIG[selectedAgent.status]?.color || '#6B7280', 0.15),
                      color: STATUS_CONFIG[selectedAgent.status]?.color || '#6B7280',
                      fontWeight: 700,
                    }}
                  />
                  <IconButton size="small" onClick={() => setSelectedAgent(null)}>
                    <Icon icon="mdi:close" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* Tabs */}
            <Tabs
              value={panelTab}
              onChange={(_, v) => setPanelTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
            >
              <Tab label="Infos & Chat" />
              <Tab label="Skills" />
              <Tab label="Mémoire" />
            </Tabs>

            {/* ─── Onglet 1 — Infos & Chat ─────────────────────────────────── */}
            <TabPanel value={panelTab} index={0}>
              {/* Tâche courante */}
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Tâche courante
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Assigner une tâche..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAssignTask()}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAssignTask}
                  disabled={taskSaving}
                  sx={{ flexShrink: 0 }}
                >
                  {taskSaving ? <CircularProgress size={16} /> : 'Assigner'}
                </Button>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Chat */}
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Chat
              </Typography>

              <Box
                sx={{
                  minHeight: 200,
                  maxHeight: 320,
                  overflow: 'auto',
                  my: 1,
                  p: 1,
                  bgcolor: alpha('#000', 0.03),
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {(chatHistory[selectedAgent.agentId] || []).length === 0 ? (
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                    Aucun message envoyé...
                  </Typography>
                ) : (
                  (chatHistory[selectedAgent.agentId] || []).map((msg, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Box
                        sx={{
                          maxWidth: '80%',
                          bgcolor: alpha(selectedAgent.avatarColor || '#3B82F6', 0.15),
                          borderRadius: '12px 12px 2px 12px',
                          px: 1.5,
                          py: 0.75,
                        }}
                      >
                        <Typography variant="body2">{msg.content}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="right">
                          {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={chatEndRef} />
              </Box>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Écrire un message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  multiline
                  maxRows={3}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSendMessage}
                  disabled={chatSending || !chatInput.trim()}
                  sx={{ flexShrink: 0, alignSelf: 'flex-end' }}
                >
                  {chatSending ? <CircularProgress size={16} /> : <Icon icon="mdi:send" />}
                </Button>
              </Stack>
            </TabPanel>

            {/* ─── Onglet 2 — Skills ───────────────────────────────────────── */}
            <TabPanel value={panelTab} index={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  Skills ({selectedAgent.skills?.length || 0})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon="mdi:plus" />}
                  onClick={() => setSkillDialogOpen(true)}
                >
                  Ajouter
                </Button>
              </Stack>

              {(selectedAgent.skills || []).length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Aucun skill configuré.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {(selectedAgent.skills || []).map((skill) => (
                    <ListItem
                      key={skill._id}
                      sx={{
                        bgcolor: alpha('#000', 0.03),
                        borderRadius: 2,
                        mb: 1,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ mr: 1.5, mt: 0.5, fontSize: 18 }}>
                        {SKILL_CATEGORY_ICONS[skill.categorie] || '🔧'}
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {skill.nom}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {skill.description}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          size="small"
                          checked={skill.active !== false}
                          onChange={() => handleToggleSkill(skill)}
                          color="success"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* ─── Onglet 3 — Mémoire ──────────────────────────────────────── */}
            <TabPanel value={panelTab} index={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  Mémoires ({selectedAgent._memories?.length || 0})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon="mdi:plus" />}
                  onClick={() => setMemDialogOpen(true)}
                >
                  Ajouter
                </Button>
              </Stack>

              {(selectedAgent._memories || []).length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Aucune mémoire active.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {(selectedAgent._memories || []).map((mem) => (
                    <ListItem
                      key={mem._id}
                      sx={{
                        bgcolor: alpha('#000', 0.03),
                        borderRadius: 2,
                        mb: 1,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ mr: 1.5, mt: 0.5, fontSize: 18 }}>
                        {MEMORY_ICONS[mem.type] || '📝'}
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {mem.titre}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {mem.contenu}
                            </Typography>
                            <Stack direction="row" spacing={0.3} sx={{ mt: 0.5 }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: i < (mem.importance || 0) ? '#F59E0B' : alpha('#000', 0.15),
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMemory(mem._id)}
                        >
                          <Icon icon="mdi:delete-outline" fontSize={16} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
          </>
        )}
      </Drawer>

      {/* ── Modal Broadcast ────────────────────────────────────────────────── */}
      <Dialog open={broadcastOpen} onClose={() => setBroadcastOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📢 Broadcast — Message à tous les agents</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Message à tous les agents..."
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBroadcastOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleBroadcast}
            disabled={broadcastLoading || !broadcastText.trim()}
            startIcon={broadcastLoading ? <CircularProgress size={16} /> : <Icon icon="mdi:bullhorn" />}
          >
            Envoyer à tous
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog Ajouter Skill ───────────────────────────────────────────── */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ajouter un skill</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom du skill"
              fullWidth
              value={newSkill.nom}
              onChange={(e) => setNewSkill((p) => ({ ...p, nom: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newSkill.description}
              onChange={(e) => setNewSkill((p) => ({ ...p, description: e.target.value }))}
            />
            <TextField
              select
              label="Catégorie"
              fullWidth
              value={newSkill.categorie}
              onChange={(e) => setNewSkill((p) => ({ ...p, categorie: e.target.value }))}
              SelectProps={{ native: true }}
            >
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {SKILL_CATEGORY_ICONS[c]} {c}
                </option>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleAddSkill}
            disabled={skillSaving || !newSkill.nom.trim()}
          >
            {skillSaving ? <CircularProgress size={16} /> : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog Ajouter Mémoire ─────────────────────────────────────────── */}
      <Dialog open={memDialogOpen} onClose={() => setMemDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ajouter une mémoire</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Titre"
              fullWidth
              value={newMem.titre}
              onChange={(e) => setNewMem((p) => ({ ...p, titre: e.target.value }))}
            />
            <TextField
              label="Contenu"
              fullWidth
              multiline
              rows={3}
              value={newMem.contenu}
              onChange={(e) => setNewMem((p) => ({ ...p, contenu: e.target.value }))}
            />
            <TextField
              select
              label="Type"
              fullWidth
              value={newMem.type}
              onChange={(e) => setNewMem((p) => ({ ...p, type: e.target.value }))}
              SelectProps={{ native: true }}
            >
              {MEMORY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEMORY_ICONS[t]} {t}
                </option>
              ))}
            </TextField>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Importance : {newMem.importance}/5
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Box
                    key={v}
                    onClick={() => setNewMem((p) => ({ ...p, importance: v }))}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      bgcolor: v <= newMem.importance ? '#F59E0B' : alpha('#000', 0.15),
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleAddMemory}
            disabled={memSaving || !newMem.titre.trim()}
          >
            {memSaving ? <CircularProgress size={16} /> : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
