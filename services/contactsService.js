const Contact = require("../models/contact");

async function listContacts() {
  console.log("Fetching all contacts...");
  try {
    const contacts = await Contact.find();
    console.log("Contacts found:", contacts.length);
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}

async function getContactById(contactId) {
  console.log(`Fetching contact by ID: ${contactId}`);
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      console.log("Contact not found");
    }
    return contact;
  } catch (error) {
    console.error(`Error fetching contact by ID: ${contactId}`, error);
    throw error;
  }
}

async function addContact({ name, email, phone }) {
  console.log("Adding new contact:", { name, email, phone });
  try {
    const newContact = await Contact.create({ name, email, phone });
    console.log("Contact added:", newContact);
    return newContact;
  } catch (error) {
    console.error("Error adding new contact:", error);
    throw error;
  }
}

async function removeContact(contactId) {
  console.log(`Removing contact by ID: ${contactId}`);
  try {
    const result = await Contact.findByIdAndDelete(contactId);
    if (result) {
      console.log("Contact deleted successfully");
    } else {
      console.log("Contact not found for deletion");
    }
    return result;
  } catch (error) {
    console.error(`Error removing contact by ID: ${contactId}`, error);
    throw error;
  }
}

async function updateContact(contactId, updates) {
  console.log(`Updating contact by ID: ${contactId}`, updates);
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, updates, {
      new: true,
    });
    if (!updatedContact) {
      console.log("Contact not found for update");
    }
    return updatedContact;
  } catch (error) {
    console.error(`Error updating contact by ID: ${contactId}`, error);
    throw error;
  }
}

async function updateStatusContact(contactId, body) {
  console.log(`Updating favorite status for contact ID: ${contactId}`, body);
  if (!body.favorite && body.favorite !== false) {
    console.log("Missing 'favorite' field in request");
    throw new Error("Missing field favorite");
  }
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite: body.favorite },
      { new: true }
    );
    if (!updatedContact) {
      console.log("Contact not found for updating favorite status");
      throw new Error("Not found");
    }
    console.log("Favorite status updated:", updatedContact);
    return updatedContact;
  } catch (error) {
    console.error("Error updating favorite status:", error);
    throw error;
  }
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};
