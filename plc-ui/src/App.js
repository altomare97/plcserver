import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Container,
} from '@mui/material';

const App = () => {
  const [area, setArea] = useState(101); // Configurazione per lettura e scrittura
  const [byte, setByte] = useState(0);
  const [numWords, setNumWords] = useState(4);
  const [data, setData] = useState([]); // Risultati lettura
  const [writeValues, setWriteValues] = useState(''); // Valori da scrivere
  const [writeNumWords, setWriteNumWords] = useState(4); // Numero di WORD da scrivere
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Funzione per leggere le WORD
  const readWords = async () => {
    setMessage('');
    setError('');
    try {
      const url = `http://localhost:3001/api/readWords?area=${area}&byte=${byte}&numWords=${numWords}`;
      const response = await axios.get(url);
      setData(response.data.values);
      setMessage('Lettura completata con successo!');
    } catch (err) {
      setError(`Errore durante la lettura: ${err.response?.data?.error || err.message}`);
    }
  };

  // Funzione per scrivere le WORD
  const writeWords = async () => {
    setMessage('');
    setError('');
    try {
      const values = writeValues.split(',').map(Number);
      if (values.length !== writeNumWords) {
        setError(`Il numero di valori (${values.length}) non corrisponde al numero di WORD da scrivere (${writeNumWords}).`);
        return;
      }
      await axios.post('http://localhost:3001/api/writeWords', {
        area,
        byte,
        values,
      });
      setMessage('Scrittura completata con successo!');
    } catch (err) {
      setError(`Errore durante la scrittura: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Gestione PLC - Lettura e Scrittura WORD
        </Typography>

        {/* Configurazione generale */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h6">Configurazione</Typography>
          <TextField
            label="Area (DB)"
            type="number"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Byte (Offset)"
            type="number"
            value={byte}
            onChange={(e) => setByte(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Numero di WORD da leggere"
            type="number"
            value={numWords}
            onChange={(e) => setNumWords(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
        </Box>

        {/* Lettura WORD */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h6">Lettura WORD</Typography>
          <Button variant="contained" color="primary" onClick={readWords} sx={{ marginBottom: 2 }}>
            Leggi WORD
          </Button>
          <List>
            {data.map((word, index) => (
              <ListItem key={index}>
                <ListItemText primary={`WORD ${index + 1}: ${word}`} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Scrittura WORD */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h6">Scrittura WORD</Typography>
          <TextField
            label="Numero di WORD da scrivere"
            type="number"
            value={writeNumWords}
            onChange={(e) => setWriteNumWords(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Valori da scrivere (separati da virgola)"
            type="text"
            value={writeValues}
            onChange={(e) => setWriteValues(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="secondary" onClick={writeWords}>
            Scrivi WORD
          </Button>
        </Box>

        {/* Messaggi di Stato */}
        {message && <Alert severity="success" sx={{ marginBottom: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
      </Box>
    </Container>
  );
};

export default App;
