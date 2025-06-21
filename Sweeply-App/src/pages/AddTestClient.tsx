import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '@/lib/api/clients';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { Loader2 } from 'lucide-react';

const AddTestClient = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const createTestClient = async () => {
      try {
        await clientsApi.create({
          name: 'Test Client',
          email: 'test@example.com',
          phone: '123-456-7890',
          address: '123 Test St, Testville, USA',
          client_type: 'residential',
        });
        toast.success('Test client created successfully!');
        navigate('/clients');
      } catch (error) {
        console.error('Error creating test client:', error);
        toast.error('Failed to create test client.');
        navigate('/clients');
      }
    };

    createTestClient();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pulse-500 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">Creating test client...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTestClient; 