const express = require('express');
const snap7 = require('node-snap7');
const plc = new snap7.S7Client();
const cors = require('cors'); // Importa CORS

const app = express();
const PORT = 3001;
// Aggiungi il middleware CORS
app.use(cors());

// Configurazione del PLC
const plcOptions = {
  host: '2.195.242.64', // Indirizzo IP del PLC
  rack: 0,              // Rack del PLC (solitamente 0)
  slot: 1,              // Slot del PLC (solitamente 1 per CPU)
};

// Connessione al PLC
function connectToPlc() {
  console.log('Tentativo di connessione al PLC...');
  plc.ConnectTo(plcOptions.host, plcOptions.rack, plcOptions.slot, (err) => {
    if (err) {
      console.error('Errore di connessione al PLC: ', err.message);
      setTimeout(connectToPlc, 2000); // Riprova dopo 2 secondi
    } else {
      console.log('Connesso al PLC!');
    }
  });
}

// Funzione per leggere più WORD dal PLC
function readWords(area, byte, numWords, callback) {
  const length = numWords * 2; // Calcola la lunghezza in byte
  plc.DBRead(area, byte, length, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      const values = [];
      for (let i = 0; i < data.length; i += 2) {
        values.push(data.readUInt16BE(i)); // Converte ogni coppia di byte in una WORD
      }
      callback(null, values);
    }
  });
}

// Funzione per scrivere più WORD nel PLC
function writeWords(area, byte, values, callback) {
  const buffer = Buffer.alloc(values.length * 2); // Crea un buffer di lunghezza appropriata
  values.forEach((value, index) => {
    buffer.writeUInt16BE(value, index * 2); // Scrive ogni WORD nel buffer
  });
  plc.DBWrite(area, byte, buffer.length, buffer, (err) => {
    callback(err);
  });
}

// Endpoint per leggere più WORD
app.get('/api/readWords', (req, res) => {
  const area = parseInt(req.query.area); // Numero del blocco dati (es. DB1)
  const byte = parseInt(req.query.byte); // Offset iniziale
  const numWords = parseInt(req.query.numWords); // Numero di WORD da leggere

  if (isNaN(area) || isNaN(byte) || isNaN(numWords)) {
    return res.status(400).json({ success: false, error: 'Parametri non validi' });
  }

  readWords(area, byte, numWords, (err, values) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, values });
    }
  });
});

// Endpoint per scrivere più WORD
app.post('/api/writeWords', express.json(), (req, res) => {
  const { area, byte, values } = req.body;

  if (!Array.isArray(values) || typeof area !== 'number' || typeof byte !== 'number') {
    return res.status(400).json({ success: false, error: 'Parametri non validi' });
  }

  writeWords(area, byte, values, (err) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Avvio del server HTTP
app.listen(PORT, () => {
  console.log(`Server HTTP avviato su http://localhost:${PORT}`);
  connectToPlc(); // Avvia la connessione al PLC
});
