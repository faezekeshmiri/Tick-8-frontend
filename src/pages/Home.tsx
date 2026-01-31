import React from "react";
import Flashcard from "../components/Flashcard";

const Home = () => {
  return (
    <>
      <div className="mt-6">
        <Flashcard
          word="serendipity"
          type="noun"
          pronunciation="/ˌserənˈdipədē/"
          translation="خوش‌آمدِ اتفاقی"
          example="Finding that book was pure serendipity."
          exampleTranslation="پیدا کردن آن کتاب، کاملاً از روی خوش‌آمدِ اتفاقی بود."
        />
      </div>
    </>
  );
};

export default Home;
  
