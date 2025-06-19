import React from 'react';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface FlashcardProps {
  word: string;
  type: string;
  pronunciation: string;
  translation: string;
  example: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, type, pronunciation, translation, example }) => {
  return (
    <div>
      <Card variant="outlined" sx={{ maxWidth: 345 }}>
        <CardContent>
          <h2>{word}</h2>
          <h5>{type}</h5>
          <h5>{pronunciation}</h5>
        </CardContent>
      </Card>
    </div>
  );
};

export default Flashcard;
