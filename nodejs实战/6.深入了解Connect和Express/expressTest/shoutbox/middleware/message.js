const express = require('express');

function message(req) {
  return (msg, type) => {
    type = type || 'info';
    let sess = req.session;
    sess.message = sess.messages || [];
    sess.messages.push({ type, string: msg })
  }
}