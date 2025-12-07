import React, { useState, useEffect } from "react";
import { AlertTriangle, Phone, Heart, Plus } from "lucide-react";
import { Contact } from "../types";

interface EmergencyInstruction {
  id: string;
  title: string;
  steps: string[];
}

const STORAGE_KEY = "emergency_contacts";
const CONTACTS_UPDATED_EVENT = "emergencyContactsUpdated";

const EmergencyPlan = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [instructions, setInstructions] = useState<EmergencyInstruction[]>([]);
  const [newContact, setNewContact] = useState<Omit<Contact, "id">>({
    name: "",
    phone: "",
    relation: "",
    type: "emergency",
  });
  const [newInstruction, setNewInstruction] = useState({
    title: "",
    steps: [""],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setContacts(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    try {
      const contact: Contact = { id: Date.now().toString(), ...newContact };
      const next = [...contacts, contact];
      setContacts(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CONTACTS_UPDATED_EVENT));
      setNewContact({ name: "", phone: "", relation: "", type: "emergency" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    }
  };

  const removeContact = async (id: string) => {
    try {
      const next = contacts.filter((contact) => contact.id !== id);
      setContacts(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CONTACTS_UPDATED_EVENT));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove contact");
    }
  };

  const addInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInstruction.title && newInstruction.steps[0]) {
      setInstructions([
        ...instructions,
        { ...newInstruction, id: Date.now().toString() },
      ]);
      setNewInstruction({ title: "", steps: [""] });
    }
  };

  const addStep = () => {
    setNewInstruction({
      ...newInstruction,
      steps: [...newInstruction.steps, ""],
    });
  };

  const updateStep = (index: number, value: string) => {
    const updatedSteps = [...newInstruction.steps];
    updatedSteps[index] = value;
    setNewInstruction({ ...newInstruction, steps: updatedSteps });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-8 w-8 text-rose-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Emergency Plan</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Contacts Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Phone className="h-5 w-5 text-rose-600 mr-2" />
              Emergency Contacts
            </h2>

            <form onSubmit={addContact} className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
              <input
                type="text"
                placeholder="Relation"
                value={newContact.relation}
                onChange={(e) =>
                  setNewContact({ ...newContact, relation: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
              <select
                value={newContact.type}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    type: e.target.value as Contact["type"],
                  })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                required
              >
                <option value="emergency">Emergency</option>
                <option value="medical">Medical</option>
                <option value="personal">Personal</option>
              </select>
              <button
                type="submit"
                className="w-full bg-rose-600 text-white p-2 rounded-md hover:bg-rose-700"
              >
                Add Contact
              </button>
            </form>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-gray-600">{contact.phone}</p>
                      <p className="text-sm text-gray-500">
                        {contact.relation}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">
                        {contact.type}
                      </span>
                    </div>
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Instructions Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 text-rose-600 mr-2" />
              Emergency Instructions
            </h2>

            <form onSubmit={addInstruction} className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Instruction Title"
                value={newInstruction.title}
                onChange={(e) =>
                  setNewInstruction({
                    ...newInstruction,
                    title: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
              />

              {newInstruction.steps.map((step, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Step ${index + 1}`}
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                />
              ))}

              <button
                type="button"
                onClick={addStep}
                className="w-full border border-rose-600 text-rose-600 p-2 rounded-md hover:bg-rose-50"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Step
              </button>

              <button
                type="submit"
                className="w-full bg-rose-600 text-white p-2 rounded-md hover:bg-rose-700"
              >
                Save Instructions
              </button>
            </form>

            <div className="space-y-4">
              {instructions.map((instruction) => (
                <div key={instruction.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{instruction.title}</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {instruction.steps.map((step, index) => (
                      <li key={index} className="text-gray-600">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPlan;
