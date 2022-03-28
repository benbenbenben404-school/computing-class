<!--Sending a request to this page searches for users
Arguments Are:
username: the string to search for
-->
<?php
//Start the session, in order to allow us to access the session variables
session_start();
//Set the content type of the returned data to XML
header('Content-Type: text/xml');


//Get the search string from the request arguments
$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_SPECIAL_CHARS);

//Start the xml data structure that will hold the usernames
$usernames = new simpleXMLElement("<xml/>");

//Set the arguments for the connection to the server
$servername = "127.0.0.1:50447";
$serverusername = "azure";
$serverpassword = "6#vWHD_$";
$dbname = "chat";

//initialize the connection to the database, and set it to utf8mb4 mode, which allows it to deal with chemistry
$conn = new mysqli($servername, $serverusername, $serverpassword, $dbname);
$conn->set_charset('utf8mb4');
//Execute the sql query to get the users that match the search string

$sql = "SELECT username FROM user WHERE LOWER( username) LIKE LOWER('%$username%') LIMIT 50";
$result = $conn->query($sql);

//Add the usernames from the query to the data structure
if ($result) {
	while ($row = $result->fetch_assoc()) {
		$usernames->addChild("username", htmlspecialchars($row["username"]));
	}
}
//close the connection to the db
$conn->close();
//return the data to the client
echo $usernames->asXML();
