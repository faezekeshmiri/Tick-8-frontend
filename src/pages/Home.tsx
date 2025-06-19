import React from "react";
import { Button } from "@mui/material"
import Flashcard from "../components/Flashcard";

const Home = () => {
  return (
    <>
      <h2 className="text-2xl font-bold underline">Home Page</h2>
      
      <Flashcard word="Good" type="adjective" pronunciation="good" translation="salam" example="The weather looks good today."/>
    </>
    );
  };
  
  export default Home;
  