"use strict";

const MetaRepository = require("./MetaRepository");

module.exports = class Handler {
  static addMeta(req, res) {
    const meta = req.body;
    MetaRepository.addMeta(meta).then(() => {
      res.send("Meta Add Success!");
    });
  }

  static getMeta(req, res) {
    MetaRepository.getAllMeta().then(meta => {
      res.send(meta);
    });
  }

  static deleteMeta(req, res) {
    const metaId = req.params.id;
    MetaRepository.removeMeta(metaId).then(() => {
      res.send("Successfully delete meta!");
    });
  }

  static putMeta(req, res) {
    const meta = req.body;
    MetaRepository.updateMeta(meta).then(() => {
      res.send("Successfully put meta!");
    });
  }
};
