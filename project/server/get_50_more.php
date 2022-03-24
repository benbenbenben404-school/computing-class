<?php
//Start the session, in order to allow us to access the session variables
session_start();
//Set the content type of the returned data to XML
header('Content-Type: text/xml');

//Get the username of the the user getting more messages from session vars
$username= $_SESSION["username"];

//Set the time from the request arguments, and the username from session variables, making sure to sanitize them in order to prevent code ingestion
$time = filter_input(INPUT_POST,'time', FILTER_SANITIZE_SPECIAL_CHARS);
$chat_id = filter_input(INPUT_POST,'chat_id', FILTER_SANITIZE_SPECIAL_CHARS);


//Setup the xml structure that will be returned
$message_data = new SimpleXMLElement('<xml/>');
//Set the arguments for the connection to the server
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialize the connection to the database, and set it to utf8mb4 mode, which allows it to deal with unicode
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');

//Execute the sql query to check that the user is in the chat
$sql = "SELECT username FROM chat_participation WHERE username='$username' AND chat_id='$chat_id' ";
$result = $conn->query($sql); 
if ($result->num_rows > 0){

	//Set up and execute query to get 50  messages  in chat, then add to data structure.
	$sql = "SELECT content, time_sent, username FROM (SELECT content, time_sent, username FROM message WHERE chat_id='$chat_id' AND time_sent <'$time' ORDER BY time_sent DESC LIMIT 50) X ORDER BY time_sent DESC";
	$message_query = $conn->query($sql); 
	//for each message gotten from the Query, add it to the xml		
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
