import { useState, useRef } from 'react';
import {
  Box, Typography, Stack, Card, CardContent, TextField, Button,
  CircularProgress, Chip, Avatar, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';

const SUGGESTION_PROMPTS = [
  'Comment améliorer la productivité de mon équipe ?',
  'Quelle stratégie marketing pour lancer un produit SaaS ?',
  'Comment optimiser les coûts de mon business ?',
  'Idées pour un nouveau service client innovant',
  'Stratégies de croissance pour une PME',
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 16, flexShrink: 0 }}>🤖</Avatar>
      )}
      <Box
        sx={{
          maxWidth: '75%',
          p: 1.5,
          borderRadius: 2,
          borderTopLeftRadius: isUser ? 2 : 0.5,
          borderTopRightRadius: isUser ? 0.5 : 2,
          bgcolor: isUser
            ? 'primary.main'
            : (t) => alpha(t.palette.grey[500], 0.1),
          color: isUser ? 'common.white' : 'text.primary',
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {message.content}
        </Typography>
        {message.timestamp && (
          <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}>
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </Box>
      {isUser && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 16, flexShrink: 0 }}>👤</Avatar>
      )}
    </Stack>
  );
}

export default function Brainstorming() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🧠 Bonjour ! Je suis votre assistant brainstorming. Partagez votre idée ou problème, et je vous aiderai à explorer des solutions créatives, analyser les opportunités et structurer votre pensée.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/api/openclaw/chat', {
        message: text.trim(),
        context: 'brainstorming',
        history: messages.slice(-6),
      });
      const reply = data.reply || data.message || data.content || 'Je réfléchis à votre idée...';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '⚠️ Désolé, je ne peux pas me connecter au serveur en ce moment. Vérifiez votre connexion.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Brainstorming IA 🧠</Typography>

      {/* Suggestion chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        {SUGGESTION_PROMPTS.map((p) => (
          <Chip
            key={p}
            label={p}
            onClick={() => sendMessage(p)}
            clickable
            size="small"
            icon={<Icon icon="eva:bulb-fill" width={14} />}
            sx={{ maxWidth: 280, fontWeight: 500 }}
          />
        ))}
      </Stack>

      <Card
        elevation={0}
        sx={{
          border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 300px)',
          minHeight: 500,
        }}
      >
        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Stack spacing={2}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {loading && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 16 }}>🤖</Avatar>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (t) => alpha(t.palette.grey[500], 0.1) }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CircularProgress size={14} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>En train de réfléchir...</Typography>
                  </Stack>
                </Box>
              </Stack>
            )}
            <div ref={bottomRef} />
          </Stack>
        </Box>

        <Divider />

        {/* Input */}
        <Stack direction="row" spacing={1.5} sx={{ p: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Partagez votre idée ou posez une question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            sx={{ borderRadius: 1.5, minWidth: 48, px: 2, fontWeight: 700 }}
          >
            <Icon icon="eva:paper-plane-fill" width={20} />
          </Button>
        </Stack>
      </Card>
    </motion.div>
  );
}
