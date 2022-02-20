<?php
	//Very simple page that logs the user out by starting a session, then emediatly ending it and redirecting the user to the landing page
	//Starting then ending the session like this clears the session variables, logging the user out. 
	session_start();
	session_destroy();
	header('Location: index.html');
?>