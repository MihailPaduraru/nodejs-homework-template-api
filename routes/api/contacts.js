const express = require("express");
const router = express.Router();
const contactsService = require("../../services/contactsService");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsService.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await contactsService.getContactById(req.params.contactId);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const contact = await contactsService.addContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const result = await contactsService.removeContact(req.params.contactId);
    if (result) {
      res.status(200).json({ message: "Contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const contact = await contactsService.updateContact(
      req.params.contactId,
      req.body
    );
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { favorite } = req.body;
    if (favorite === undefined) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    const updatedContact = await contactsService.updateStatusContact(
      contactId,
      { favorite }
    );
    res.json(updatedContact);
  } catch (error) {
    if (error.message === "Not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message === "Missing field favorite") {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
});

module.exports = router;
