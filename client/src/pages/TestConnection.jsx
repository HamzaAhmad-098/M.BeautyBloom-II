import { useState, useEffect } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    const tests = {};
    
    try {
      // Test 1: Get API URL
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
``
      tests.apiUrl = apiUrl;
      
      // Test 2: Health endpoint
      const healthRes = await axios.get(`${apiUrl}/health`);
      tests.health = {
        status: '✅ Connected',
        message: healthRes.data.message,
        timestamp: healthRes.data.timestamp
      };
      
      // Test 3: Products endpoint
      try {
        const productsRes = await axios.get(`${apiUrl}/products`);
        tests.products = {
          status: '✅ Working',
          count: productsRes.data.products?.length || productsRes.data.length || 0
        };
      } catch (err) {
        tests.products = {
          status: '❌ Failed',
          error: err.message
        };
      }
      
      // Test 4: CORS test
      try {
        const corsRes = await fetch(`${apiUrl}/health`, {
          method: 'OPTIONS',
          mode: 'cors'
        });
        tests.cors = {
          status: corsRes.ok ? '✅ Enabled' : '❌ Failed',
          headers: {
            origin: corsRes.headers.get('access-control-allow-origin'),
            methods: corsRes.headers.get('access-control-allow-methods')
          }
        };
      } catch (err) {
        tests.cors = {
          status: '❌ Failed',
          error: err.message
        };
      }
      
    } catch (error) {
      tests.overall = {
        status: '❌ Connection Failed',
        error: error.message,
        details: error.response?.data
      };
    }
    
    setStatus(tests);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Connection Test</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Testing connection...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API URL */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
              <div className="bg-gray-100 p-3 rounded">
                <code className="text-sm">VITE_API_URL = {status.apiUrl}</code>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This should be: <code>https://mbeautybloom-production.up.railway.app/api</code>
              </p>
            </div>
            
            {/* Health Check */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Backend Health</h2>
              {status.health ? (
                <div className="text-green-600">
                  <p className="font-medium">✅ {status.health.status}</p>
                  <p>{status.health.message}</p>
                  <p className="text-sm text-gray-500 mt-1">Time: {status.health.timestamp}</p>
                </div>
              ) : (
                <p className="text-red-600">❌ Failed to connect to backend</p>
              )}
            </div>
            
            {/* CORS Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">CORS Configuration</h2>
              {status.cors ? (
                <div>
                  <p className={status.cors.status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                    {status.cors.status}
                  </p>
                  {status.cors.headers && (
                    <div className="mt-2 text-sm">
                      <p>Allowed Origin: <code>{status.cors.headers.origin || 'Not set'}</code></p>
                      <p>Allowed Methods: <code>{status.cors.headers.methods || 'Not set'}</code></p>
                    </div>
                  )}
                  {status.cors.error && (
                    <p className="text-red-500 text-sm mt-2">Error: {status.cors.error}</p>
                  )}
                </div>
              ) : (
                <p className="text-yellow-600">⚠️ CORS test not run</p>
              )}
            </div>
            
            {/* Products Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Products API</h2>
              {status.products ? (
                <div>
                  <p className={status.products.status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                    {status.products.status}
                  </p>
                  {status.products.count !== undefined && (
                    <p>Found {status.products.count} products</p>
                  )}
                  {status.products.error && (
                    <p className="text-red-500 text-sm mt-2">Error: {status.products.error}</p>
                  )}
                </div>
              ) : (
                <p className="text-yellow-600">⚠️ Products test not run</p>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Again
              </button>
              <button
                onClick={() => window.open('https://mbeautybloom-production.up.railway.app/api/health', '_blank')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Open Backend API
              </button>
            </div>
            
            {/* Debug Info */}
            <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono">
              <p>Frontend URL: https://resilient-paletas-effc41.netlify.app</p>
              <p>Backend URL: https://mbeautybloom-production.up.railway.app/api</p>
              <p>Test Time: {new Date().toISOString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConnection;