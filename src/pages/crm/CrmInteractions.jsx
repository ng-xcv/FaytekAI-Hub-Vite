import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Chip, FormControl, Grid, InputLabel, MenuItem, Paper,
  Select, Stack, Typography, LinearProgress
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import axiosInstance from '../../utils/axios';

const TYPE_COLORS = {
  email: '#1976d2',
  appel: '#388e3c',
  reunion: '#f57c00',
  note: '#7b1fa2',
};

const TYPES = ['email', 'appel', 'reunion', 'note'];

export default function CrmInteractions() {
  const [interactions, setInteractions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      // We fetch all interactions by querying all contacts interactions
      // Backend doesn't have a global /interactions endpoint, so we use stats + contacts
      const { data } = await axiosInstance.get('/api/crm/contacts', { params: { limit: 200 } });
      const contacts = Array.isArray(data) ? data : (data.contacts || []);

      // Fetch interactions for each contact (limited to first 50 contacts for perf)
      const results = await Promise.all(
        contacts.slice(0, 50).map(c =>
          axiosInstance.get(`/api/crm/contacts/${c._id}/interactions`)
            .then(r => (r.data || []).map(inter => ({ ...inter, contactNom: `${c.nom} ${c.prenom || ''}`.trim() })))
            .catch(() => [])
        )
      );
      const all = results.flat().sort((a, b) => new Date(b.dateInteraction) - new Date(a.dateInteraction));
      setInteractions(all);
    } catch (err) {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  const filtered = filterType
    ? interactions.filter(i => i.type === filterType)
    : interactions;

  // Stats by type
  const statsData = TYPES.map(type => ({
    name: type,
    count: interactions.filter(i => i.type === type).length,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        CRM — Interactions
      </Typography>

      {/* Stats BarChart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Interactions par type
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {statsData.map((entry) => (
                <Cell key={entry.name} fill={TYPE_COLORS[entry.name] || '#888'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Filtre */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} interaction{filtered.length > 1 ? 's' : ''}
        </Typography>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Liste interactions */}
      <Stack spacing={1.5}>
        {filtered.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary">
            Aucune interaction trouvée
          </Typography>
        )}
        {filtered.map(inter => (
          <Paper key={inter._id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={inter.type}
                  size="small"
                  sx={{
                    bgcolor: TYPE_COLORS[inter.type] || '#888',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="subtitle2">{inter.contactNom}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {new Date(inter.dateInteraction).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1 }}>{inter.notes}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
