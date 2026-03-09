import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../services/api';

const KnowledgeGraph = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchGraphData = async () => {
        try {
            const response = await api.get('/notes/graph');
            const formattedNodes = response.data.nodes.map((n, i) => ({
                id: n.id,
                position: n.position || { x: (i * 100) % 500, y: (i * 100) % 500 },
                data: { label: n.data.label },
                style: { 
                    backgroundColor: n.data.color || '#ffffff', 
                    border: '1px solid #cbd5e1', 
                    padding: '10px 20px', 
                    borderRadius: '8px',
                    fontWeight: '500',
                    color: '#334155'
                }
            }));
            const formattedEdges = response.data.edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                animated: true,
                style: { stroke: '#94a3b8', strokeWidth: 2 }
            }));
            
            setNodes(formattedNodes);
            setEdges(formattedEdges);
        } catch (error) {
            console.error('Error fetching graph data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGraphData();
    }, []);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Constructing Knowledge Graph...</div>;
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Second Brain Knowledge Graph</h1>
            
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                <ReactFlow 
                    nodes={nodes} 
                    edges={edges} 
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(event, node) => navigate(`/notes?note=${encodeURIComponent(node.data.label)}`)}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Background color="#94a3b8" gap={16} />
                    <Controls />
                    <MiniMap 
                        nodeColor={(n) => n.style?.backgroundColor || '#fff'}
                        maskColor="rgba(0, 0, 0, 0.1)"
                    />
                </ReactFlow>
            </div>
        </div>
    );
};

export default KnowledgeGraph;
