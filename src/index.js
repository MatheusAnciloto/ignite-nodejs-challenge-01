const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  console.log(username);

  const userExists = users.find(user => user.username == username);

  console.log(userExists);
  
  if(!userExists) return response.status(404).json({ error: "User doesn't exist!" });

  request.user = userExists;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.some(user => user.username == username);
  
  if(userExists) return response.status(400).json({ error: "User already exists!" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  console.log(users);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  console.log(request.user)
  
  const user = users.find(user => user.username === request.user.username);

  console.log(user.todos);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  request.user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoIndex = request.user.todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0) return response.status(404).json({ error: 'Todo not found!' });

  request.user.todos[todoIndex] = {
    ...request.user.todos[todoIndex],
    title,
    deadline: new Date(deadline)
  };

  return response.json(request.user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoIndex = request.user.todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0) return response.status(404).json({ error: 'Todo not found!' });

  request.user.todos[todoIndex] = {
    ...request.user.todos[todoIndex],
    done: true,
  };

  return response.json(request.user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoIndex = request.user.todos.findIndex(todo => todo.id === id);

  if(todoIndex < 0) return response.status(404).json({ error: 'Todo not found!' });

  request.user.todos = request.user.todos.filter((item, index) => index != todoIndex);

  return response.status(204).send('Todo deleted!');
});

module.exports = app;