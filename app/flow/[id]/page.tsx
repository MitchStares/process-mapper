'use client'

import { useEffect, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import ProcessMapper from '../../ProcessMapper';

const LoadFlow = () => {
  const { setNodes, setEdges } = useReactFlow();
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlow = async () => {
      if (params.id) {
        try {
          const { data, error } = await supabase
            .from('flows')
            .select('flow_data')
            .eq('id', params.id)
            .single();

          if (error) throw error;

          setNodes(data.flow_data.nodes);
          setEdges(data.flow_data.edges);
        } catch (error) {
          console.error('Error loading flow:', error instanceof Error ? error.message : String(error));
        } finally {
          setLoading(false);
        }
      }
    };

    loadFlow();
  }, [params.id, setNodes, setEdges]);

  if (loading) return <div>Loading...</div>;

  return <ProcessMapper />;
};

export default LoadFlow;
