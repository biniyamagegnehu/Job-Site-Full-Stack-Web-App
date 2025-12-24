import axios from 'axios';

export const testBackendFormat = async () => {
  try {
    // Test different payload formats
    const testPayloads = [
      // Format 1
      {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'ROLE_JOB_SEEKER'
      },
      // Format 2
      {
        username: 'test@example.com',
        email: 'test@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User',
        userRole: 'ROLE_JOB_SEEKER'
      },
      // Format 3
      {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'JOB_SEEKER' // Without ROLE_ prefix
      }
    ];

    for (let i = 0; i < testPayloads.length; i++) {
      console.log(`Testing format ${i + 1}:`, testPayloads[i]);
      
      try {
        const response = await axios.post('http://localhost:8080/api/auth/register', testPayloads[i], {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✓ Format ${i + 1} SUCCESS:`, response.data);
        return testPayloads[i]; // Return the successful format
      } catch (error) {
        console.log(`✗ Format ${i + 1} FAILED:`, error.response?.data || error.message);
      }
    }
    
    console.log('All formats failed. Checking backend documentation...');
    
    // Try to get backend info
    try {
      const infoResponse = await axios.get('http://localhost:8080/actuator/mappings');
      console.log('Backend endpoints:', infoResponse.data);
    } catch (err) {
      console.log('Could not get backend info', err?.message || err);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Also test with curl command
export const getCurlCommand = () => {
  return `
    Try these curl commands to test the backend:
    
    1. Basic format:
    curl -X POST http://localhost:8080/api/auth/register \\
      -H "Content-Type: application/json" \\
      -d '{"email":"test@test.com","password":"password123","firstName":"Test","lastName":"User","role":"ROLE_JOB_SEEKER"}'
    
    2. Alternative field names:
    curl -X POST http://localhost:8080/api/auth/register \\
      -H "Content-Type: application/json" \\
      -d '{"username":"test@test.com","password":"password123","firstname":"Test","lastname":"User"}'
    
    3. Minimal format:
    curl -X POST http://localhost:8080/api/auth/register \\
      -H "Content-Type: application/json" \\
      -d '{"email":"test@test.com","password":"password123"}'
  `;
};