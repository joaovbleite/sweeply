import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../../../src/lib/api/clients';
import { jobsApi } from '../../../src/lib/api/jobs';
import { toast } from 'sonner';
import AppLayout from '../components/AppLayout';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AddTestJob = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const createTestJob = async () => {
      try {
        // Find the test client
        const clients = await clientsApi.getAll();
        const testClient = clients.find(c => c.name === 'Test Client');

        if (!testClient) {
          toast.error('Test Client not found. Please create it first by visiting /add-test-client');
          navigate('/clients');
          return;
        }

        // Create a test job for today
        await jobsApi.create({
          client_id: testClient.id,
          title: 'Test Job - Daily Cleaning',
          service_type: 'regular',
          property_type: 'residential',
          scheduled_date: format(new Date(), 'yyyy-MM-dd'),
          scheduled_time: '10:00',
          estimated_price: 150,
          address: testClient.address,
        });

        toast.success('Test job created successfully for today!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating test job:', error);
        toast.error('Failed to create test job.');
        navigate('/jobs');
      }
    };

    createTestJob();
  }, [navigate]);

  return (
    <AppLayout hideBottomNav>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pulse-500 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">Creating test job...</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTestJob; 