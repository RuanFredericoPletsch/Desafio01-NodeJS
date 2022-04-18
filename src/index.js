const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middleware
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({error: 'User do not exist'})
  }

  request.user = user

  return next();
}

//Create user
app.post('/users', (request, response) => {
  const {name, username} = request.body

  const usernameAlreadyUsed = users.find(user => user.username === username)

  if(usernameAlreadyUsed){
    return response.status(400).json({error: 'Username already claimed!'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
    }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.json(users.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  const todo = ({
      id: uuidv4(),
      title,
      done: false,
      deadLine: new Date(deadline),
      created_at: new Date()
  })

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadLine}= request.body
  const {id} = request.params

  const validTodo = user.todos.find(todo => todo.id === id)

  if (!validTodo){
    return response.status(404).json({error: 'Todo invalid'})
  }

  todo.title = title
  todo.deadLine = new Date(deadLine)

  return response.json(validTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const validTodo = user.todos.find(todo => todo.id === id)

  if (!validTodo){
    return response.status(404).json({error: 'Todo invalid'})
  }

  validTodo.done = true

  return response.json(validTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoSpot = user.todos.findIndex(todo => todo.id === id) 

  if (todoSpot === -1){
    return response.status(404).json({error: 'Todo invalid'})
  }

  user.todos.splice(todoSpot, 1)

  return request.status(204).json()
});

module.exports = app;