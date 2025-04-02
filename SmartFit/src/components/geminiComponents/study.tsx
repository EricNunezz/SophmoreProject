
// imports the useState hook from react which lets us create and manage state variables 
import { useState } from "react"; 
//import button from ui components
import { Button } from "@/components/ui/button";
// import getGeminiResponse from the api file 
import { getGeminiResponse } from "@/lib/api";

//define and export a react functional component 
export function GeminiCard(){
  //create a state variable 'response' and a function to update it 'setResponse;
  //initially set it to an empty string 
  const [response, setResponse] = useState("");

  //create a state variable 'isLoading' and a function to update it 'setIsLoading'
  const[isLoading, setIsLoading] = useState(false);

  //define a async function to handle the API call
  const testGeminiAPI = async () => {
    //log to console that the button was clicked (for debugging)
    console.log("Button clicked, testing API");

    setIsLoading(true);

    //update the response state to loading to show the user something is happening 
    setResponse("Loading...")

      try { 
        //call teh getGeminiResponse function with a prompt about fitness 
        const result = await getGeminiResponse("...Prompt");

        console.log("Api Result: ", result)

        //now update the response state with the result from the API 
        //if the result is null/ undefined
        setResponse(result || "No response recieved")
      } catch(error){
        //if error occurs during teh API call log it into the console
        console.error("Error testing gemini api", error);

        //update the response state with the error message
        //this checks if 'error' is an instance of Error, if so, gets its message
        //otherwise, it uses a generic error message
      setResponse(`Error: ${error instanceof Error ? error.message : "Failed to get response from Gemini API"}`);
      }finally{
        //whether the api call succeeded ro failed, set isLoading back to false 
        setIsLoading(false);
      }
  };

  //return the JSX that defines what the component renders
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* button that triggers the api call when clicked*/ }
      <Button size = "lg" onClick={testGeminiAPI} disabled = {isLoading}>
        {/*button text changes based on loading state*/ }
        {isLoading ? "Testing..." : "Test Gemini API"}
      </Button>

      {/* only show this div if there is a response (conditional rendering) */ }
      {response && (
        <div className="mt-4 p-4 border rounded max-w-xl">
          <h3 className="font-bold mb-2">API Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
/*key concepts in file 

1. React Hooks: 
  - the useState hook creates state variables that persist between renders 
    and trigger re-renders when updated 

2. Async functions: 
  - testGeminiAPI is a asynchronous function (marked with async) that can use await 
    to waiut for promises to resolve
  - this allows us to wait for the API call to complete before updating the UI 

3. Error Handling: 
  - the try/catch/finally block handles successfull API calls as well as errors
  - the finally block ensures isLoading is set back to false regardless of whether the API
    call succeeded or failed 

4. Conditional Rendering: 

  - {isLoading ? "Testing..." : "Test Gemini API"} 
    changes the button text based on loading state
  - {response && (...) } only renders th eresponse section if there is a response 

5. API Integration: 
  - The component calls an external API through the getGeminiResponse function 
    imported from @/lib/api
  - it sends a predefined prompt to the API reuesting fitness advice





*/
