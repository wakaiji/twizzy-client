import React from "react";
import "./question.style.css";
import diamond from "../../../assets/diamond.svg";
import triangle from "../../../assets/triangle.svg";
import circle from "../../../assets/circle.svg";
import square from "../../../assets/square.svg";
import Answer from "../Answer/Answer";

function Question({ question, timer, host, isAnswerClicked, onClick }) {
  return (
    <div className="question">
      {host && (
        <>
          <h2 className="question-name">{question.question}</h2>
          <div className="container">
            <div className="question-time">{timer}</div>
            {question.backgroundImage && (
              <img src={question.backgroundImage} alt="background question" />
            )}
            <div></div>
          </div>
        </>
      )}
      <div className="answers-container">
        <Answer
          body={question.answerList[0].body}
          icon={triangle}
          showText={host ? true : false}
          isAnswerClicked={isAnswerClicked}
          onClick={onClick}
        />
        <Answer
          body={question.answerList[1].body}
          icon={diamond}
          showText={host ? true : false}
          isAnswerClicked={isAnswerClicked}
          onClick={onClick}
        />
        {question.questionType !== "True/False" && (
          <>
            <Answer
          body={question.answerList[2].body}
          icon={circle}
          showText={host ? true : false}
          isAnswerClicked={isAnswerClicked}
          onClick={onClick}
        />
        <Answer
          body={question.answerList[3].body}
          icon={square}
          showText={host ? true : false}
          isAnswerClicked={isAnswerClicked}
          onClick={onClick}
        />
          </>
        )}
      </div>
    </div>
  )
}

export default Question;