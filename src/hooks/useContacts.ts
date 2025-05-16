import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Contact } from "client/shared/schema";

export function useContacts() {
  const queryClient = useQueryClient();
  
  // Get all contacts
  const contactsQuery = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      return response.json();
    }
  });
  
  // Create a new contact
  const createContactMutation = useMutation({
    mutationFn: async (contact: Omit<Contact, "id" | "userId" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/contacts", contact);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    }
  });
  
  // Update an existing contact
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, ...contact }: Partial<Contact> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/contacts/${id}`, contact);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    }
  });
  
  // Delete a contact
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    }
  });
  
  return {
    contacts: contactsQuery.data || [],
    isLoading: contactsQuery.isLoading,
    error: contactsQuery.error,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending
  };
}