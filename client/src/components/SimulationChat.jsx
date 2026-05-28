import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import useSimulationStore from '../store/simulationStore';

const SimulationChat = ({ simulationId, onEndSimulation }) => {
  const { token } = useAuthStore();
  const { 
    currentSimulation, 
    fetchSimulationDetails, 
    sendMessage, 
    finishSimulation, 
    isLoading,
    error: storeError
  } = useSimulationStore();
  
  const [messageText, setMessageText] = useState('');
  const [localError, setLocalError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (simulationId && token) {
      setLocalError(null);
      fetchSimulationDetails(simulationId, token).catch(err => setLocalError(err.message));
    }
  }, [simulationId, token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSimulation?.chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || isLoading) return;
    
    const textToSend = messageText;
    setMessageText('');
    setLocalError(null);
    try {
      await sendMessage(simulationId, textToSend, token);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(textToSend); // restaura el texto si falla
      setLocalError(error.message || 'Error al enviar el mensaje.');
    }
  };

  const handleEndSimulation = async () => {
    if (!window.confirm('¿Estás seguro de finalizar la simulación? Necesitas al menos 5 minutos de conversación para recibir tu puntuación.')) {
      return;
    }
    
    setLocalError(null);
    try {
      await finishSimulation(simulationId, token);
      if (onEndSimulation) onEndSimulation();
    } catch (error) {
      console.error('Error ending simulation:', error);
      setLocalError(error.message || 'Error al finalizar la simulación.');
    }
  };

  if (!currentSimulation) {
    return <div className="p-4 text-center text-gray-500">Cargando simulación...</div>;
  }

  const isCompleted = currentSimulation.status === 'completed';

  let safeChatHistory = [];
  try {
    const raw = Array.isArray(currentSimulation.chatHistory)
      ? currentSimulation.chatHistory
      : JSON.parse(currentSimulation.chatHistory || '[]');
    // Solo mostramos mensajes con contenido real (filtra burbujas vacías)
    safeChatHistory = raw.filter(msg => msg && msg.content && msg.content.trim() !== '');
  } catch (error) {
    console.error("Error al procesar el historial de chat:", error);
    safeChatHistory = [];
  }

  return (
    <div className="flex flex-col h-full max-h-[800px] bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Simulador de Entrevista</h2>
          <p className="text-sm text-gray-500">Rol: <span className="font-semibold">{currentSimulation.simulatedRole}</span></p>
        </div>
        {!isCompleted && (
          <button
            onClick={handleEndSimulation}
            disabled={isLoading}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium text-sm transition-colors border border-red-200"
          >
            Finalizar Simulación
          </button>
        )}
        {isCompleted && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            Completada
          </span>
        )}
      </div>

      {(localError || storeError) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{localError || storeError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
        {/* Aquí usamos safeChatHistory en lugar de currentSimulation.chatHistory */}
        {safeChatHistory.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-green-700 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}
            >
              {msg.role === 'ai' && (
                <div className="flex items-center mb-1 space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-800 text-xs font-bold">IA</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Entrevistador</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex space-x-2 items-center">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Results View (if completed) */}
      {isCompleted && (
        <div className="p-6 bg-green-50 border-t border-green-200 rounded-b-lg">
          <h3 className="text-lg font-bold text-green-900 mb-2">Resultados de la Simulación</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-green-500 shadow-md">
              <span className="text-xl font-bold text-green-700">{currentSimulation.overallScore}%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 uppercase tracking-wide">Puntuación General</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-green-100">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Retroalimentación de la IA:</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {currentSimulation.aiFeedbackSummary}
            </p>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isCompleted && (
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex space-x-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe tu respuesta aquí... (Usa el método STAR si es posible)"
              className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-14"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !messageText.trim()}
              className="bg-green-700 text-white px-6 py-2 rounded-md font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Enviar
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Presiona Enter para enviar, Shift+Enter para nueva línea.</p>
        </form>
      )}
    </div>
  );
};

export default SimulationChat;