import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Hall = Database['public']['Tables']['halls']['Row'];
export type HallInsert = Database['public']['Tables']['halls']['Insert'];
export type HallUpdate = Database['public']['Tables']['halls']['Update'];

export function useHalls() {
  return useQuery({
    queryKey: ['halls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('halls')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Hall[];
    },
  });
}

export function useActiveHalls() {
  return useQuery({
    queryKey: ['halls', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('halls')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Hall[];
    },
  });
}

export function useCreateHall() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hall: Omit<HallInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('halls')
        .insert(hall)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Hall created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create hall: ${error.message}`);
    },
  });
}

export function useUpdateHall() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: HallUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('halls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success('Hall updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update hall: ${error.message}`);
    },
  });
}

export function useToggleHallStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('halls')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success(`Hall ${data.is_active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update hall status: ${error.message}`);
    },
  });
}
