'use strict';

const { remote } = require('electron');
const validationService = remote.require('../main/validation-service');

const messageEl = document.querySelector('#message');
const nameInputEl = document.querySelector('input[name=name]');
const promiseButtonEl = document.querySelector('#promise-button');
const syncButtonEl = document.querySelector('#sync-button');

function setMessage(message = '', className = 'success') {
  messageEl.className = className;
  messageEl.innerText = message;
}

nameInputEl.addEventListener('keydown', () => setMessage(), false);

promiseButtonEl.addEventListener('click', event => {
  event.preventDefault();

  validationService.validateWithPromise(nameInputEl.value)
    .then(() => setMessage('Valid!'))
    .catch(error => setMessage(error.message, 'error'));
}, false);

syncButtonEl.addEventListener('click', event => {
  event.preventDefault();

  try {
    validationService.validateSynchronously(nameInputEl.value);
    setMessage('Valid!');
  } catch (error) {
    setMessage(error.message);
  }
}, false);
