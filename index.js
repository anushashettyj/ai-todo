import { ilike, eq } from 'drizzle-orm';
import { db } from './db/index.js'
import { todosTable } from './db/schema.js'
import readlineSync from 'readline-sync';
import OpenAI from "openai";

const openai = new OpenAI();

//Tools
async function getAllTodos() {
  const todos = await db.select().from(todosTable);
  return todos;
}

async function createTodo(todo) {
  const [result] = await db.insert(todosTable).values({
    todo,
  }).returning({
    id: todosTable.id
  });
  return result.id;
}

async function searchTodo(search) {
  const todos = await db.select().from(todosTable).where(ilike(todosTable.todo, `%${search}%`));
  return todos;
}

async function deleteTodoById(id) {
  await db.delete(todosTable).where(eq(todosTable.id, id));
}

const SYSTEM_PROMPT = `
  You are an AI To-Do list Assistant with START, PLAN, ACTION, Observation and Output State.
  Wait for the user prompt and first PLAN using available tools.
  After Planning, Take the action with appropriate tools and wait for the Observation based on Action.
  Once you get the Observations, Return the AI response based on Start prompt and Observations.
  
  You can manage tasks by adding, viewing, updating and deleting them.
  You must strictly follow the JSON output format.

  Todo DB Schema:
  id: Int and Primary ke
  todo: String
  created_at: Date Time
  updated_at: Date Time

  Available Tools:
  - getAllTodos()" Returns all the Todods from Database
  - createTodo(todo: String): Creates a new Todo in the DB and takes todo as a string and returns the ID of created todo
  - searchTodo(query: string): Search for all todos matching the query string using iLike in DB
  - deleteTodoById(id: string): Delete the todo by ID given in the DB

  Example:
  START
  { "type": "user", "user": "Add a task for shopping groceries." }
  { "type": "plan", "plan": "I will try to get more context on what user needs to shop." }
  { "type": "output", "output": "Can you tell me what all items you want to shop? " }
  { "type": "user", "user": "I want to shop milk, cookies, bread, rice. " }
  { "type": "plan", "plan": "I will try to use createTodo to create a new Todo in DB. " }
  { "type": "action", "function": "createTodo", "input": "Shop for milk, cookies, bread, rice." }
  { "type":"observation", "observation": "2" }
  { "type": "output", "output": "Your todo has been added successfully" }

`

const tools = {
  getAllTodos: getAllTodos,
  createTodo: createTodo,
  searchTodo: searchTodo,
  deleteTodoById: deleteTodoById
}

const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

while (true) {
  const query = readlineSync.question('>> ');
  const userMessage = {
    type: 'user',
    user: query,
  };
  messages.push({ role: 'user', content: JSON.stringify(userMessage) });
  // Auto Prompt
  while (true) {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      response_format: { type: 'json_object' },
    });
    const result = chat.choices[0].message.content;
    messages.push({ role: 'assistant', content: result });

    // console.log('\n\n -------- START AI ---------------');
    // console.log(result);
    // console.log(' -------- END AI ---------------\n\n');

    const action = JSON.parse(result);

    if (action.type === 'output') {
      console.log(` ${action.output}`);
      break;
    } else if (action.type === 'action') {
      const fn = tools[action.function];
      if (!fn) throw new Error('Invalid Tool Call');
      const observation = await fn(action.input);
      const observationMessage = {
        type: 'observation',
        observation: observation,
      }
      messages.push({ role: 'developer', content: JSON.stringify(observationMessage) });
    }
  }

}
