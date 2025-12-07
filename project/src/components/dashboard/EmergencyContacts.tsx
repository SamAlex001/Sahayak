import React, { useEffect, useState } from "react";
import { Phone, Heart, Building2 } from "lucide-react";
import ContactCard from "./ContactCard";
import { Contact } from "../../types";

const STORAGE_KEY = "emergency_contacts";
const CONTACTS_UPDATED_EVENT = "emergencyContactsUpdated";

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const loadContacts = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setContacts([]);
          return;
        }

        const parsed = JSON.parse(stored) as Contact[];
        setContacts(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Failed to load emergency contacts from storage", error);
        setContacts([]);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        loadContacts();
      }
    };

    const handleCustomUpdate = () => loadContacts();

    loadContacts();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(CONTACTS_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CONTACTS_UPDATED_EVENT, handleCustomUpdate);
    };
  }, []);

  const getIcon = (type: Contact["type"]) => {
    switch (type) {
      case "medical":
        return <Building2 className="h-5 w-5 text-blue-500" />;
      case "emergency":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "personal":
      default:
        return <Phone className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
      {contacts.length === 0 ? (
        <p className="text-sm text-gray-500">
          No emergency contacts saved yet. Add them in the Emergency Plan to see
          them here.
        </p>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              icon={getIcon(contact.type)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
