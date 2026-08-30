const Workflow = require('../models/Workflow');
const env = require('../config/env');

const generateWorkflow = async (prompt, userId) => {
  let workflowData;

  if (env.OPENROUTER_API_KEY) {
    try {
      workflowData = await generateWithOpenRouter(prompt);
    } catch (err) {
      console.warn('OpenRouter generation failed, trying Gemini:', err.message);
    }
  }

  if (!workflowData && env.GEMINI_API_KEY) {
    try {
      workflowData = await generateWithGemini(prompt);
    } catch (err) {
      console.warn('Gemini generation failed, using deterministic builder:', err.message);
    }
  }

  if (!workflowData) {
    workflowData = generateDeterministic(prompt);
  }

  const workflow = await Workflow.create({
    name: workflowData.name || 'Generated Workflow',
    description: workflowData.description || `Generated from: ${prompt}`,
    owner: userId,
    nodes: workflowData.nodes,
    edges: workflowData.edges,
    triggerConfig: { type: 'manual' },
    status: 'draft',
  });

  return workflow;
};

const generateWithOpenRouter = async (prompt) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://agentflow.ai',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a workflow generator. Given a prompt, output a JSON object with: name, description, nodes (array of {id, type, label, position: {x,y}, config: {}}), and edges (array of {id, source, target, label, animated}). Node types: trigger, action, condition, ai, integration, notification. Return ONLY valid JSON.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error('OpenRouter API error');
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content.replace(/```json\n?/g, '').replace(/```/g, ''));
};

const generateWithGemini = async (prompt) => {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(
    `You are a workflow generator. Given a prompt, output a JSON object with: name, description, nodes (array of {id, type, label, position: {x,y}, config: {}}), and edges (array of {id, source, target, label, animated}). Node types: trigger, action, condition, ai, integration, notification. Return ONLY valid JSON. Prompt: ${prompt}`
  );

  const text = result.response.text();
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, ''));
};

const generateDeterministic = (prompt) => {
  const lower = prompt.toLowerCase();

  const nodes = [];
  const edges = [];
  let nodeIndex = 0;

  const addNode = (type, label, x, y, config = {}) => {
    const id = `node-${nodeIndex++}`;
    nodes.push({ id, type, label, position: { x, y }, config });
    return id;
  };

  const addEdge = (source, target, label = '') => {
    edges.push({ id: `edge-${edges.length}`, source, target, label, animated: true });
  };

  const triggerId = addNode('trigger', 'Trigger', 250, 50, { triggerType: 'manual' });

  if (lower.includes('email') || lower.includes('gmail') || lower.includes('mail')) {
    const emailId = addNode('integration', 'Send Email', 250, 200, { provider: 'gmail', action: 'send' });
    addEdge(triggerId, emailId, 'on trigger');
    if (lower.includes('notification') || lower.includes('slack') || lower.includes('discord')) {
      const notifId = addNode('notification', 'Notify Team', 250, 350, { channel: lower.includes('slack') ? 'slack' : 'discord' });
      addEdge(emailId, notifId, 'after send');
    }
  } else if (lower.includes('slack') || lower.includes('discord')) {
    const msgId = addNode('integration', 'Send Message', 250, 200, { provider: lower.includes('slack') ? 'slack' : 'discord', action: 'send' });
    addEdge(triggerId, msgId, 'on trigger');
  } else if (lower.includes('sheet') || lower.includes('spreadsheet') || lower.includes('google sheet')) {
    const sheetId = addNode('integration', 'Append Row', 250, 200, { provider: 'google-sheets', action: 'append' });
    addEdge(triggerId, sheetId, 'on trigger');
    const aiId = addNode('ai', 'Analyze Data', 250, 350, { provider: 'analyze', prompt: 'Analyze the appended row data' });
    addEdge(sheetId, aiId, 'after append');
  } else if (lower.includes('ai') || lower.includes('analyze') || lower.includes('generate')) {
    const aiId = addNode('ai', 'AI Processing', 250, 200, { provider: 'openrouter', prompt });
    addEdge(triggerId, aiId, 'on trigger');
    const notifId = addNode('notification', 'Send Results', 250, 350, {});
    addEdge(aiId, notifId, 'after analysis');
  } else if (lower.includes('invoice') || lower.includes('billing')) {
    const processId = addNode('action', 'Process Invoice', 250, 200, { actionType: 'invoice' });
    addEdge(triggerId, processId, 'on trigger');
    const condId = addNode('condition', 'Amount > $1000?', 250, 350, { condition: 'amount > 1000' });
    addEdge(processId, condId, 'validate');
    const approvalId = addNode('action', 'Route for Approval', 150, 500, { actionType: 'approval' });
    const autoId = addNode('action', 'Auto-Process', 350, 500, { actionType: 'auto' });
    addEdge(condId, approvalId, 'yes');
    addEdge(condId, autoId, 'no');
  } else {
    const actionId = addNode('action', 'Process Data', 250, 200, { actionType: 'transform' });
    addEdge(triggerId, actionId, 'on trigger');
    const outputId = addNode('notification', 'Output Results', 250, 350, {});
    addEdge(actionId, outputId, 'complete');
  }

  const nameFromPrompt = prompt.split(/\s+/).slice(0, 5).join(' ');
  return {
    name: nameFromPrompt || 'Generated Workflow',
    description: `Workflow generated from: ${prompt}`,
    nodes,
    edges,
  };
};

module.exports = { generateWorkflow };
