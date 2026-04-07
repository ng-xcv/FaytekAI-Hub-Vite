import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, TextField, InputAdornment,
  Chip, Button, CircularProgress, Select, MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';

const CATEGORY_CONFIG = {
  daily: { label: 'Daily', icon: 'eva:calendar-fill', color: 'info' },
  core: { label: 'Core', icon: 'eva:bulb-fill', color: 'secondary' },
  heartbeat: { label: 'Heartbeat', icon: 'eva:activity-fill', color: 'error' },
  other: { label: 'Autre', icon: 'eva:file-text-fill', color: 'default' },
};

function MemoryCard({ entry, selected, onClick }) {
  const cfg = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.other;
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        border: (t) => `1px solid ${selected ? t.palette.primary.main : alpha(t.palette.divider, 0.5)}`,
        borderRadius: 1.5,
        cursor: 'pointer',
        bgcolor: selected ? alpha('#6366f1', 0.05) : 'background.paper',
        '&:hover': { borderColor: 'primary.light' },
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Chip
            icon={<Icon icon={cfg.icon} width={12} />}
            label={cfg.label}
            size="small"
            color={cfg.color}
            sx={{ height: 20, fontSize: 10 }}
          />
          {entry.date && (
            <Typography variant="caption" sx={{ color: 'text.disabled', ml: 'auto' }}>
              {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </Typography>
          )}
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>{entry.title}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {entry.content}
        </Typography>
        {entry.tags?.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }} flexWrap="wrap">
            {entry.tags.slice(0, 3).map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 16, fontSize: 9 }} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function Memory() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/mission-control/memory')
      .then(({ data }) => setEntries(data.entries || data || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) => {
      const matchCat = category === 'all' || e.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return e.title?.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q) || e.tags?.some((t) => t.toLowerCase().includes(q));
    });
  }, [entries, search, category]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Mémoire 🧠</Typography>

      {/* Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Rechercher dans les mémoires..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="eva:search-fill" width={18} /></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        <Select size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Toutes les catégories</MenuItem>
          {Object.entries(CATEGORY_CONFIG).map(([v, c]) => <MenuItem key={v} value={v}>{c.label}</MenuItem>)}
        </Select>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ height: { lg: 'calc(100vh - 250px)' } }}>
          {/* List */}
          <Box sx={{ flex: '0 0 380px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography fontSize={48}>🔍</Typography>
                <Typography sx={{ color: 'text.secondary', mt: 1 }}>Aucune mémoire trouvée</Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {filtered.map((entry) => (
                  <MemoryCard
                    key={entry._id || entry.id}
                    entry={entry}
                    selected={selected?._id === entry._id || selected?.id === entry.id}
                    onClick={() => setSelected(entry)}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Detail */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {selected ? (
              <Card elevation={0} sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`, borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{selected.title}</Typography>
                      {selected.date && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(selected.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                      )}
                    </Box>
                    {selected.category && (
                      <Chip
                        label={CATEGORY_CONFIG[selected.category]?.label || selected.category}
                        color={CATEGORY_CONFIG[selected.category]?.color || 'default'}
                        size="small"
                      />
                    )}
                  </Stack>

                  {selected.tags?.length > 0 && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 2 }}>
                      {selected.tags.map((t) => (
                        <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 22 }} />
                      ))}
                    </Stack>
                  )}

                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {selected.content}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  border: (t) => `2px dashed ${alpha(t.palette.divider, 0.5)}`,
                  borderRadius: 2,
                }}
              >
                <Typography fontSize={48}>🧠</Typography>
                <Typography sx={{ color: 'text.secondary', mt: 1 }}>Sélectionnez une mémoire</Typography>
              </Box>
            )}
          </Box>
        </Stack>
      )}
    </motion.div>
  );
}
