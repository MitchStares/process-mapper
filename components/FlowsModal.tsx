import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@supabase/auth-helpers-react';

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

  const handleSaveFlow = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a flow.",
        variant: "destructive",
      });
      return;
    }

    if (!newFlowName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your flow.",
        variant: "destructive",
      });
      return;
    }

    const flowData = onSaveFlow();
    console.log('Flow data to be saved:', flowData); // Log the flow data

    const { data, error } = await supabase
      .from('flows')
      .insert([{ 
        name: newFlowName, 
        data: flowData,
        user_id: user.id
      }]);

    if (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: "Failed to save flow.",
        variant: "destructive",
      });
    } else {
      console.log('Flow saved successfully:', data);
      toast({
        title: "Success",
        description: "Flow saved successfully.",
      });
      setNewFlowName('');
      fetchFlows();
    }
  };

  const handleLoadFlow = (flow: Flow) => {
    onLoadFlow(flow.data);
    onClose();
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
            <Button onClick={handleSaveFlow}>Save Current Flow</Button>
          </div>
          <div className="space-y-2">
            {flows.map((flow) => (
              <div key={flow.id} className="flex justify-between items-center">
                <span>{flow.name}</span>
                <Button onClick={() => handleLoadFlow(flow)}>Load</Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlowsModal;
