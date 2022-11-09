import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WaitingRoom from "../WaitingRoom/WaitingRoom";
import { useDispatch, useSelector } from "react-redux";
import { getGame } from "../../../actions/game";
import { getQuiz } from "../../../actions/quiz";
import {
  updateQuestionLeaderboard,
  updateCurrentLeaderboard,
} from "../../../actions/leaderboard";
import "./hostScreen.style.css";
import Question from "../Question/Question";

function HostScreen() {
  const socket = useSelector((state) => state.socket.socket)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isPreviewScreen, setIsPreviewScreen] = useState(false)
  const [isQuestionScreen, setIsQuestionScreen] = useState(false)
  const [isQuestionResultScreen, setIsQuestionResultScreen] = useState(false)
  const [isLeaderboardScreen, setIsLeaderboardScreen] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timer, setTimer] = useState(0)
  const [playerList, setPlayerList] = useState([])
  const [questionData, setQuestionData] = useState({
    questionType: "Quiz",
    pointType: "Standard",
    answerTime: 5,
    backgroundImage: "",
    question: "",
    answerList: [
      { name: "a", body: "", isCorrect: false },
      { name: "b", body: "", isCorrect: false },
      { name: "c", body: "", isCorrect: false },
      { name: "d", body: "", isCorrect: false },
    ],
    questionIndex: 1,
  })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { game } = useSelector((state) => state.games)
  const { quiz } = useSelector((state) => state.quiz)
  const { leaderboard } = useSelector((state) => state.leaderboards)
  const [questionResult, setQuestionResult] = useState(
    leaderboard?.questionLeaderboard[0]
  )
  const [currentLeaderboard, setCurrentLeaderboard] = useState(
    leaderboard?.currentLeaderboard[0]
  )

  useEffect(() => {
    dispatch(getGame(id))
  }, [id, dispatch])

  useEffect(() => {
    if (game) {
      dispatch(getQuiz(game.quizId))
    }
  }, [dispatch, game])

  useEffect(() => {
    setTimer(5)
  }, [])

  useEffect(() => {
    const updateLeaderboard = async (data, id, score) => {
      let question = await dispatch(updateQuestionLeaderboard(data, id))
      setQuestionResult(question.questionLeaderboard[data.questionIndex - 1])
      let leaderboardData = {
        questionIndex: data.questionIndex,
        playerId: data.playerId,
        playerCurrentScore: score,
      }
      let leaderboard = await dispatch(
        updateCurrentLeaderboard(leaderboardData, id)
      )
      setCurrentLeaderboard(
        leaderboard.currentLeaderboard[data.questionIndex - 1]
      )
    }

    socket?.on("get-answer-from-player", (data, id, score, player) => {
      updateLeaderboard(data, id, score)
      let playerData = { id: data.playerId, userName: player.userName }
      setPlayerList((prevstate) => [...prevstate, playerData])
    })
  }, [socket, dispatch])

  

  const startGame = () => {
    socket.emit("start-game", quiz)
    socket.emit("question-preview", () => {
      startPreviewCountdown(5, currentQuestionIndex)
    })
    setIsGameStarted((prevstate) => !prevstate)
    setIsPreviewScreen(true)
  }

  const startPreviewCountdown = (seconds, index) => {
    setIsLeaderboardScreen(false)
    setIsPreviewScreen(true)
    let time = seconds
    let interval = setInterval(() => {
      setTimer(time)
      if (time === 0) {
        clearInterval(interval)
        displayQuestion(index)
        setIsPreviewScreen(false)
        setIsQuestionScreen(true)
      }
      time--
    }, 1000)
  }

  const startQuestionCountdown = (seconds, index) => {
    let time = seconds
    let interval = setInterval(() => {
      setTimer(time)
      if (time === 0) {
        clearInterval(interval)
        displayQuestionResult()
      }
      time--
    }, 1000)
  }
  const displayQuestionResult = () => {
    setIsQuestionScreen(false)
    setIsQuestionResultScreen(true)
    
  }

  const displayCurrentLeaderBoard = () => {
    setIsQuestionResultScreen(false)
    setIsLeaderboardScreen(true)
  }

  const displayQuestion = (index) => {
    if (index === (quiz.questionList.length)) {
      socket.emit("host-to-leaderboard")
      navigate("/leaderboard")
      // displayCurrentLeaderBoard(index)
    } else {
      setQuestionData(quiz.questionList[index])
      setCurrentQuestionIndex((prevstate) => prevstate + 1)
      let time = quiz.questionList[index].answerTime
      let question = {
        answerList: quiz.questionList[index].answerList,
        questionIndex: quiz.questionList[index].questionIndex,
        correctAnswersCount: quiz.questionList[index].answerList.filter(
          (answer) => answer.isCorrect === true
        ).length,
      }
      socket.emit("start-question-timer", time, question, () => {
        startQuestionCountdown(time, index + 1)
      })
    }
  }

  const clickNextLeaderboard = () => {
    displayCurrentLeaderBoard()
  }

  const clickNextQuestion = () => {
    socket.emit("question-preview", () => {
      startPreviewCountdown(5, currentQuestionIndex)
      setPlayerList([])
    })
  }

  // console.log(playerList)
  return (
    <div className="page">
      {!isGameStarted && (
        <div className="lobby">
          <button onClick={startGame}>
            Start a game
          </button>
          <WaitingRoom pin={game?.pin} socket={socket} />
        </div>
      )}

      {isPreviewScreen && (
        <div className="timer-preview timer-center">
          <h2>Waiting for question</h2>
          <h1>{timer}</h1>
        </div>
      )}
      {isQuestionScreen && (
        <div className="timer-preview">
          <Question 
            key={questionData.questionIndex}
            question={questionData}
            timer={timer}
            host={true}
          />
        </div>
      )}
      {isQuestionResultScreen && (
        <section className="leaderboard">
          <div className="card-leaderboard">
            <button onClick={clickNextLeaderboard}>
              Next
            </button>
            <h1 className="leaderboard-title">
              Question result
            </h1>
            <div className="winner-leaderboard">
              <ol>
                {questionResult.questionResultList.map((player, index) => (
                  <li key={index}>
                    <span>{index+1}</span>
                    {playerList
                      .filter((x) => x.id === player.playerId)
                      .map((x, index) => (
                        <span key={index}>{x.userName}</span>
                      ))
                    }
                    <span>{player.playerPoints}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}
      {isLeaderboardScreen && (
        <section className="leaderboard">
          <div className="card-leaderboard">
            <button onClick={clickNextQuestion}>
              Next Question
            </button>
            <h1 className="leaderboard-title">
              Leaderboard
            </h1>
            <div className="winner-leaderboard">
              <ol>
                {currentLeaderboard.leaderboardList.map((player, index) => (
                  <li key={index}>
                    <span>{index+1}</span>
                    {playerList
                      .filter((x) => x.id === player.playerId)
                      .map((x, index) => (
                        <span key={index}>{x.userName}</span>
                      ))
                    }
                    <span>{player.playerCurrentScore}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HostScreen;