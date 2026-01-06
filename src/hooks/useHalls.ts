import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Hall = Database['public']['Tables']['halls']['Row'];

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
