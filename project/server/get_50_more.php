<?php
//Start the session, inorder to allow us to access the session variables
session_start();
//Set the content type of the returned data to XML
header('Content-Type: text/xml');
//Set the defualt timezone to UTC for dates.
date_default_timezone_set('UTC');
//Set the time from the request arguments, and the username from session variables
// $time = filter_input(INPUT_POST,'time', FILTER_SANITIZE_SPECIAL_CHARS);
// $chat_id = filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);

//check if the session variable is et before getting username. If its not, set the response code to 403, wich is incorrect auth, and kill the connection
$username =$_SESSION["username"];
$chat_id =$_REQUEST["chat_id"];
$time =$_REQUEST["time"];



//Set the arguments for the connection to the server
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialise the connection to the dataabse, and set it to utf8mb4 mode, which allows it to deal with chemistry
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');
//Execute the sql query to check that the user is in the chat
$sql = "SELECT username FROM chat_participation WHERE username='$username' AND chat_id='$chat_id' ";
$result = $conn->query($sql); 
$message_data = new SimpleXMLElement('<xml/>');
if ($result->num_rows > 0){
	//Start the XML data structure that will be returned


	
	//Set up and excexute query to get 50  messgaes  in chat, then add to data structure.
	$sql = "SELECT content, time_sent, username FROM (SELECT content, time_sent, username FROM message WHERE chat_id='$chat_id' AND time_sent <'$time' ORDER BY time_sent DESC LIMIT 50) X ORDER BY time_sent DESC";
	$message_query = $conn->query($sql); 
		
	while($message_details = $message_query->fetch_assoc()){
		  $message = $message_data ->addChild("message");
  		  $message ->addChild("content", htmlspecialchars($message_details["content"]));
  		  $message ->addChild("time", htmlspecialchars($message_details["time_sent"]));
  		  $message ->addChild("sender", htmlspecialchars($message_details["username"]));
	}
}


//close the connection to the db
$conn->close();
//return the data to the client
echo $message_data->asXML();
?>