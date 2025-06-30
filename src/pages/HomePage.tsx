// Placeholder for HomePage component
import React from 'react';
import ExampleComponent from '../components/ExampleComponent';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Dounie Cuisine Pro</h1>
      <ExampleComponent message="This is a message from the ExampleComponent on the HomePage." />
      <p>This is the main landing page of the application.</p>
    </div>
  );
};

export default HomePage;
