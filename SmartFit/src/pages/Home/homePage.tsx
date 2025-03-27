
import {Link} from "react-router-dom";

function Home(){
  return(
    <div>
      <h1> Welcome to the Home page</h1>
      <Link to = "/Register">Register</Link>
      <br></br>
      <Link to = "/Login">Login</Link>
      <br></br>
      <Link to = "/quizPage">Quiz</Link>


    </div>
  )
}

export default Home; 
