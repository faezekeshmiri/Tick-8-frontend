import React from 'react';

interface FlashcardProps {
  name: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ name }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
    </div>
  );
};

export default Flashcard;
