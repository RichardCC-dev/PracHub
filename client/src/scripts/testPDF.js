// Script para probar la generación de PDF desde el frontend
const testPDFGeneration = async () => {
  try {
    const token = localStorage.getItem('prachub_token');
    if (!token) {
      console.error('No hay token de autenticación');
      return;
    }

    console.log('🧪 Enviando solicitud de prueba de PDF...');
    
    const response = await fetch('http://localhost:4000/api/debug/test-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Éxito:', result);
    } else {
      console.error('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
};

// Ejecutar la prueba
testPDFGeneration();
