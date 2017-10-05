const express = require('express');
const router  = express.Router();
const Evento  = require('../models/evento');
const middlewareAuth = require('../utils/middlewareAuth');
const moment = require('moment');

router.post('/', middlewareAuth, function(req, res) {
  let evento = new Evento(req.body);
  evento.save(function(err) {

    if (err) {
      res.send(err);
    }
    res.json({
      message: 'Event created',
      event: evento
    });

  });
});

router.get('/', function(req, res) {
  let filtro = {};
  const formatos = [
    "YYYY-MM-DD",
    "DD-MM-YYYY"
  ];

  if (req.query.passados) {

    filtro['data.inicio'] = {
      $lte: moment().startOf('day').format()
    }

  } else {

    let intervalo = {};

    if (req.query.after && moment(req.query.after, formatos).isValid()) {
      intervalo.$gte = moment(req.query.after, formatos).startOf('day').format();
    }

    if (req.query.before && moment(req.query.before, formatos).isValid()) {
      intervalo.$lte = moment(req.query.before, formatos).endOf('day').format();
    }

    filtro['data.inicio'] = intervalo;

  }

  if (Object.keys(filtro).length === 0) {
    filtro['data.inicio'] = {
      $gte: moment().startOf('day').format()
    };
  }

  Evento
    .find(filtro, function(err, eventos) {
      if (err) {
        res.send(err);
      }
      res.json(eventos);
    })
    .sort('data.inicio')
  ;
});

router.get('/:id', function(req, res) {
  Evento.findById(req.params.id, function(err, evento) {
    if (err) {
      res.send(err);
    }
    res.json(evento);
  });
});

router.put('/:id', middlewareAuth, function(req, res) {
  Evento.findOneAndUpdate({
    _id: req.params.id
  }, req.body, { new: true }, function(err, evento) {

    if (err) {
      res.send(err);
    }
    res.send({
      message:"Event updated",
      event: evento
    });

  });
});

router.delete('/:id', middlewareAuth, function(req, res) {
  Evento.remove({ _id: req.params.id }, function(err) {
    if (err) {
      res.send(err);
    }
    res.json({ message: 'Event removed' });
  });
});

module.exports = router;
