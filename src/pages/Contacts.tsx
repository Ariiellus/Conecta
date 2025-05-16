import { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  Search, 
  Star, 
  MoreVertical, 
  Loader2, 
  User, 
  Trash,
  Edit,
  Mail,
  Phone
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Contact } from "client/shared/schema";

export default function Contacts() {
  const { contacts, isLoading, createContact, updateContact, deleteContact, isCreating, isUpdating, isDeleting } = useContacts();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    favorite: false
  });
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    contact => contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(groupedContacts).sort();
  
  const handleAddContact = () => {
    if (!newContact.name) {
      toast({
        title: "Missing Information",
        description: "Contact name is required.",
        variant: "destructive",
      });
      return;
    }
    
    createContact(newContact, {
      onSuccess: () => {
        setShowAddDialog(false);
        setNewContact({
          name: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
          favorite: false
        });
        toast({
          title: "Contact Added",
          description: "The contact has been added successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to add contact: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleUpdateContact = () => {
    if (!editingContact) return;
    
    if (!editingContact.name) {
      toast({
        title: "Missing Information",
        description: "Contact name is required.",
        variant: "destructive",
      });
      return;
    }
    
    updateContact({
      id: editingContact.id,
      name: editingContact.name,
      email: editingContact.email,
      phone: editingContact.phone,
      address: editingContact.address,
      notes: editingContact.notes,
      favorite: editingContact.favorite
    }, {
      onSuccess: () => {
        setEditingContact(null);
        toast({
          title: "Contact Updated",
          description: "The contact has been updated successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update contact: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleDeleteContact = (id: number) => {
    deleteContact(id, {
      onSuccess: () => {
        toast({
          title: "Contact Deleted",
          description: "The contact has been deleted successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to delete contact: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const toggleFavorite = (contact: Contact) => {
    updateContact({
      id: contact.id,
      favorite: !contact.favorite
    }, {
      onSuccess: () => {
        toast({
          title: contact.favorite ? "Removed from Favorites" : "Added to Favorites",
          description: `${contact.name} has been ${contact.favorite ? "removed from" : "added to"} favorites.`
        });
      }
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Contacts</h1>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search contacts" 
              className="pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="h-12">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new contact to your list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newContact.email || ""}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={newContact.phone || ""}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address/Wallet</Label>
                  <Input 
                    id="address" 
                    value={newContact.address || ""}
                    onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                    placeholder="john.eth or 0x..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={newContact.notes || ""}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    placeholder="Add some notes about this contact..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Contact"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit Contact Dialog */}
          <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update the contact details.
                </DialogDescription>
              </DialogHeader>
              {editingContact && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input 
                      id="edit-name" 
                      value={editingContact.name}
                      onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input 
                      id="edit-email" 
                      type="email"
                      value={editingContact.email || ""}
                      onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input 
                      id="edit-phone" 
                      value={editingContact.phone || ""}
                      onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address/Wallet</Label>
                    <Input 
                      id="edit-address" 
                      value={editingContact.address || ""}
                      onChange={(e) => setEditingContact({...editingContact, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea 
                      id="edit-notes" 
                      value={editingContact.notes || ""}
                      onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingContact(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateContact} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Contact"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "Try adjusting your search term." : "Start by adding some contacts."}
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Favorites section */}
          {contacts.some(c => c.favorite) && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Favorites</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.filter(c => c.favorite).map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onEdit={() => setEditingContact(contact)}
                    onDelete={() => handleDeleteContact(contact.id)}
                    onToggleFavorite={() => toggleFavorite(contact)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* All contacts by letter */}
          {sortedKeys.map(letter => (
            <div key={letter}>
              <h2 className="text-lg font-semibold mb-4">{letter}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContacts[letter].map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onEdit={() => setEditingContact(contact)}
                    onDelete={() => handleDeleteContact(contact.id)}
                    onToggleFavorite={() => toggleFavorite(contact)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ContactCardProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function ContactCard({ contact, onEdit, onDelete, onToggleFavorite }: ContactCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getRandomColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500"
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-start">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getRandomColor(contact.name)}`}>
        {getInitials(contact.name)}
      </div>
      <div className="ml-4 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{contact.name}</h3>
            {contact.email && (
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="text-sm text-gray-600 flex items-center mt-1">
                <Phone className="h-3 w-3 mr-1" />
                {contact.phone}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button 
              className={`mr-1 focus:outline-none ${contact.favorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
              onClick={onToggleFavorite}
              title={contact.favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className="h-5 w-5" fill={contact.favorite ? "currentColor" : "none"} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {contact.address && (
          <div className="text-sm text-gray-600 mt-1 break-all">
            <span className="font-medium">Address:</span> {contact.address}
          </div>
        )}
        {contact.notes && (
          <div className="text-sm text-gray-600 mt-2 border-t border-gray-100 pt-2">
            {contact.notes}
          </div>
        )}
      </div>
    </div>
  );
}