import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@supabase/auth-helpers-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';

interface Flow {
  id: string;
  name: string;
  data: string;
  created_at: string;
}

interface FlowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFlow: (flowData: string) => void;
  onSaveFlow: () => string;
}

const FlowsModal: React.FC<FlowsModalProps> = ({ isOpen, onClose, onLoadFlow, onSaveFlow }) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [newFlowName, setNewFlowName] = useState('');
  const { toast } = useToast();
  const user = useUser();

  const fetchFlows = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch flows.",
        variant: "destructive",
      });
    } else {
      setFlows(data || []);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isOpen && user) {
      fetchFlows();
    }
  }, [isOpen, user, fetchFlows]);

  const handleSaveFlow = async (existingFlowId?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a flow.",
        variant: "destructive",
      });
      return;
    }

    if (!newFlowName.trim() && !existingFlowId) {
      toast({
        title: "Error",
        description: "Please enter a name for your flow.",
        variant: "destructive",
      });
      return;
    }

    const flowData = onSaveFlow();
    console.log('Flow data to be saved:', flowData);

    try {
      let result;
      if (existingFlowId) {
        result = await supabase
          .from('flows')
          .update({ data: flowData })
          .eq('id', existingFlowId)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('flows')
          .insert([{ 
            name: newFlowName, 
            data: flowData,
            user_id: user.id
          }]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: existingFlowId ? "Flow updated successfully." : "Flow saved successfully.",
      });
      setNewFlowName('');
      fetchFlows();
    } catch (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: "Failed to save flow.",
        variant: "destructive",
      });
    }
  };

  const handleLoadFlow = (flow: Flow) => {
    onLoadFlow(flow.data);
    onClose();
  };

  const handleDeleteFlow = async (flowId: string) => {
    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flow deleted successfully.",
      });
      fetchFlows();
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast({
        title: "Error",
        description: "Failed to delete flow.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Flows</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Enter flow name"
            />
            <Button onClick={() => handleSaveFlow()}>Save New Flow</Button>
          </div>
          <div className="space-y-2">
            {flows.map((flow) => (
              <div key={flow.id} className="flex justify-between items-center">
                <span>{flow.name}</span>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleLoadFlow(flow)}>Load</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSaveFlow(flow.id)}>
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteFlow(flow.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlowsModal;
