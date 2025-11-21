
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { generateStream, getRunningModels } from '../services/geminiService';
import { ChatMessage, RouteConfig, ProviderType } from '../types';
import { INITIAL_ROUTES } from '../constants';

export const Playground: React.FC = () => {
  // We use RouteConfig structure for the dropdown, even if dynamically fetched
  const [availableRoutes, setAvailableRoutes] = useState<RouteConfig[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate current selected route object
  const selectedRoute = availableRoutes.find(r => r.id === selectedRouteId) || availableRoutes[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Initial Discovery on Mount
  useEffect(() => {
    const discover = async () => {
      setIsDiscovering(true);
      const dynamicRoutes: RouteConfig[] = [];
      
      // Check Ollama
      const ollamaModels = await getRunningModels(ProviderType.OLLAMA, 'http://localhost:11434');
      ollamaModels.forEach(m => {
        dynamicRoutes.push({
          id: `ollama-${m.name}`,
          name: m.name,
          modelName: m.name,
          provider: ProviderType.OLLAMA,
          endpoint: 'http://localhost:11434',
          isEnabled: true,
          priority: 1,
          latencyMs: 0
        });
      });

      // Check vLLM
      const vllmModels = await getRunningModels(ProviderType.VLLM, 'http://localhost:8000');
      vllmModels.forEach(m => {
        dynamicRoutes.push({
          id: `vllm-${m.name}`,
          name: m.name,
          modelName: m.name,
          provider: ProviderType.VLLM,
          endpoint: 'http://localhost:8000',
          isEnabled: true,
          priority: 1,
          latencyMs: 0
        });
      });

      if (dynamicRoutes.length > 0) {
        setAvailableRoutes(dynamicRoutes);
        setSelectedRouteId(dynamicRoutes[0].id);
      } else {
        // Fallback if nothing found
        setAvailableRoutes(INITIAL_ROUTES);
        setSelectedRouteId(INITIAL_ROUTES[0].id);
      }
      setIsDiscovering(false);
    };

    discover();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedRoute) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      const stream = generateStream(
        selectedRoute.modelName, 
        userMsg.content,
        selectedRoute.endpoint,
        selectedRoute.provider
      );
      
      for await (const chunk of stream) {
         fullResponse += chunk;
         setMessages(prev => {
           const newArr = [...prev];
           const lastMsg = newArr[newArr.length - 1];
           if (lastMsg.role === 'model') {
             lastMsg.content = fullResponse;
           }
           return newArr;
         });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: `Error: Failed to route request. ${error}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col -m-8 bg-zinc-950">
      {/* Playground Header */}
      <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2">
             <span className="text-sm text-zinc-400">Target Model:</span>
             {isDiscovering ? (
                <div className="flex items-center text-xs text-orange-400 animate-pulse px-2">
                  <Icons.Network className="w-3 h-3 mr-2" />
                  Discovering...
                </div>
             ) : (
               <select 
                 value={selectedRouteId} 
                 onChange={(e) => setSelectedRouteId(e.target.value)}
                 className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-orange-500 min-w-[200px]"
               >
                 {availableRoutes.map(route => (
                   <option key={route.id} value={route.id}>
                     {route.modelName} ({route.provider})
                   </option>
                 ))}
               </select>
             )}
           </div>
           {!isDiscovering && selectedRoute && (
             <>
               <div className="h-4 w-[1px] bg-zinc-700"></div>
               <div className="flex items-center space-x-2 text-xs text-zinc-500 font-mono">
                  <Icons.Server className="w-3 h-3" />
                  <span>{selectedRoute.endpoint}</span>
               </div>
             </>
           )}
        </div>
        <button onClick={() => setMessages([])} className="text-xs text-zinc-500 hover:text-white transition-colors">
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
            <Icons.Terminal className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Internal Gateway Playground</p>
            <p className="text-sm">
              {isDiscovering ? 'Scanning for local models...' : `Test prompts against ${selectedRoute?.modelName || 'local models'}`}
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-4 ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
            }`}>
              <div className="text-xs opacity-50 mb-1 font-mono uppercase">{msg.role}</div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center space-x-2">
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDiscovering ? "Waiting for models..." : `Send to ${selectedRoute?.modelName}...`}
            disabled={isDiscovering}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-4 pr-12 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || isDiscovering}
            className="absolute right-2 top-2 p-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icons.Play className="w-4 h-4" />
          </button>
        </form>
        {selectedRoute && (
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
             <span>Direct Connection to: {selectedRoute.provider}</span>
             <span className="font-mono">{selectedRoute.modelName}</span>
          </div>
        )}
      </div>
    </div>
  );
};
