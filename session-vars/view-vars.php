<?php
// Start the session
session_start();
?>
<!DOCTYPE html>
<html>
<body>

<?php

	echo $_SESSION["name"];
	echo $_SESSION["age"];

?>



</body>
</html>
