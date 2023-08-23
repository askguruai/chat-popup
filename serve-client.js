import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 8088;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'remote-app', 'build')));

app.get('/remote-script', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'chat-application', 'build', 'static', 'js', 'bundle.js'));
  } catch (error) {
    res.json({ error });
  }
});

app.get('/remote-style', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'chat-application', 'build', 'static', 'css', 'main.0f38262c.css'));
  } catch (error) {
    res.json({ error });
  }
});

app.listen(port);
