// simple proxy server for OpenAI chat completions
// run with: node server.js
// make sure to set OPENAI_API_KEY in your environment

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());
// serve all static files (HTML, CSS, JS, media) from the workspace root
app.use(express.static(path.join(process.cwd())));

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'missing message' });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                max_tokens: 150
            })
        });

        if (!response.ok) {
            const text = await response.text();
            return res.status(response.status).send(text);
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('proxy error', err);
        res.status(500).json({ error: 'server error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy server listening on ${port}`));