import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  created_at: string;
  auth_type: string;
}

export default function AdminPage() {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading users...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Error loading users</h1>
        <p>Make sure you have admin access</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#166534', marginBottom: '20px' }}>User Signups Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Total Users:</strong> {users?.length || 0}</p>
        <p><strong>Traditional Signups:</strong> {users?.filter(u => u.auth_type === 'traditional').length || 0}</p>
      </div>
      
      {users && users.length > 0 ? (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Auth Type</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Signup Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ 
                backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <td style={{ padding: '12px' }}>
                  {user.first_name} {user.last_name}
                </td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>{user.username || '-'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: user.auth_type === 'traditional' ? '#dcfce7' : '#dbeafe',
                    color: user.auth_type === 'traditional' ? '#166534' : '#1e40af'
                  }}>
                    {user.auth_type}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(user.created_at).toLocaleDateString()} at{' '}
                  {new Date(user.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>No users have signed up yet.</p>
          <p style={{ color: '#9ca3af' }}>New signups will appear here automatically.</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
        <h3 style={{ color: '#166534', marginTop: 0 }}>💡 SmartSuite Integration</h3>
        <p style={{ color: '#15803d', margin: 0 }}>
          User data can be automatically synced to SmartSuite when they sign up. 
          Contact me if you'd like to set up automatic data transfer.
        </p>
      </div>
    </div>
  );
}