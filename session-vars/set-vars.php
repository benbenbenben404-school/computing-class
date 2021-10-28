<?php
// Start the session
session_start();
?>
<!DOCTYPE html>
<html>
<body>

<?php
if ($_GET["name"]) {
	$_SESSION["name"] = $_GET["name"];
	$_SESSION["age"] = $_GET["age"];
}
?>


<form action="set-vars.php" method ="get">
	<input name="name" type="text">
	<input name="age" type="number">
	<input type="submit">
</form>
</body>
</html>
