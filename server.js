import express from 'express';

const people = [];

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.get('/api/people', (req, res) => {
    res.status(200).json({
      success: true,
      data: people
    });
  });

  app.post('/api/people', (req, res) => {
    const { name, place, email, phone, details } = req.body || {};

    if (!name || !place) {
      return res.status(400).json({
        success: false,
        message: 'Name and place are required.'
      });
    }

    const person = {
      id: people.length + 1,
      name: String(name).trim(),
      place: String(place).trim(),
      email: email ? String(email).trim() : '',
      phone: phone ? String(phone).trim() : '',
      details: details ? String(details).trim() : '',
      createdAt: new Date().toISOString()
    };

    people.push(person);

    return res.status(201).json({
      success: true,
      message: 'Person details saved successfully.',
      data: person
    });
  });

  return app;
}

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
