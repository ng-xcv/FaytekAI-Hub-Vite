import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Chip, Button, CircularProgress,
  Avatar, Divider, LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import { useSelector } from 'react-redux';

const SKILL_CATEGORY_ICONS = {
  technique: '⚙️', communication: '💬', analyse: '🔍',
  creation: '✨', gestion: '📊', autre: '🔧',
};

const MEM_TYPE_ICONS = {
  fact: '📌', preference: '⭐', project: '🗂️', lesson: '📚', instruction: '📋', recap: '📝',
};

function SkillCard({ skill }) {
  const icon = SKILL_CATEGORY_ICONS[skill.categorie] || '🔧';
  return (
    <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}`, borderRadius: 1.5 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={20}>{icon}</Typography>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{skill.nom}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{skill.description}</Typography>
          </Box>
          <Chip
            label={skill.active ? 'Actif' : 'Inactif'}
            size="small"
            color={skill.active ? 'success' : 'default'}
            sx={{ height: 20, fontSize: 10 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function MemoryItem({ mem }) {
  const icon = MEM_TYPE_ICONS[mem.type] || '📝';
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1.5, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.3)}` }}>
      <Typography fontSize={18}>{icon}</Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{mem.titre}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {mem.contenu}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 0.5 }}>
        {Array.from({ length: Math.min(mem.importance || 1, 5) }).map((_, i) => (
          <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }} />
        ))}
      </Box>
    </Stack>
  );
}

export default function Office() {
  const [skills, setSkills] = useState([]);
  const [memories, setMemories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { list: tasks } = useSelector((s) => s.task);
  const { list: projects } = useSelector((s) => s.project);

  useEffect(() => {
    const load = async () => {
      try {
        const [agentsRes, memRes] = await Promise.all([
          axiosInstance.get('/api/mission-control/agents').catch(() => ({ data: [] })),
          axiosInstance.get('/api/mission-control/memory').catch(() => ({ data: [] })),
        ]);
        setAgents(agentsRes.data?.agents || agentsRes.data || []);
        setMemories(memRes.data?.entries || memRes.data || []);

        // Load skills from first agent
        const firstAgent = (agentsRes.data?.agents || agentsRes.data || [])[0];
        if (firstAgent?._id || firstAgent?.id) {
          const skillsRes = await axiosInstance.get(`/api/agents/${firstAgent._id || firstAgent.id}/skills`).catch(() => ({ data: [] }));
          setSkills(skillsRes.data?.skills || skillsRes.data || []);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const activeProjects = projects.filter((p) => p.status === 'active' || !p.status).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Office 🏢</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {/* Workspace Overview */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Vue d&apos;ensemble</Typography>
                <Stack spacing={2}>
                  {[
                    { label: 'Tâches complétées', value: doneTasks, total: tasks.length, color: 'success' },
                    { label: 'Projets actifs', value: activeProjects, total: projects.length, color: 'primary' },
                    { label: 'Agents opérationnels', value: agents.filter((a) => a.status === 'active').length, total: agents.length, color: 'info' },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.value} / {item.total}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={item.total > 0 ? (item.value / item.total) * 100 : 0}
                        color={item.color}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Agents */}
            <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Agents</Typography>
                {agents.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>Aucun agent</Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {agents.map((agent) => (
                      <Stack key={agent._id || agent.id} direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 36, height: 36 }}>{agent.nom?.[0] || '🤖'}</Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{agent.nom || agent.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{agent.role}</Typography>
                        </Box>
                        <Chip
                          label={agent.status || 'idle'}
                          size="small"
                          color={agent.status === 'active' ? 'success' : agent.status === 'idle' ? 'warning' : 'default'}
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Skills & Memory */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Skills */}
              <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Compétences IA</Typography>
                  {skills.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>Aucune compétence</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {skills.slice(0, 5).map((s) => <SkillCard key={s._id || s.id} skill={s} />)}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Recent Memory */}
              <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Mémoire récente</Typography>
                  {memories.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>Aucune mémoire</Typography>
                  ) : (
                    <Box>
                      {memories.slice(0, 5).map((m) => <MemoryItem key={m._id || m.id} mem={m} />)}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}
    </motion.div>
  );
}
