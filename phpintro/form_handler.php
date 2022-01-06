<?php

$servername = "127.0.0.1:50447";
$username = "azure";
$password = "6#vWHD_$";
$dbname = "testdb"; // only bit you need to change
// Parsing connnection string
foreach ($_SERVER as $key => $value) {
    if (strpos($key, "MYSQLCONNSTR_") !== 0) {
        continue;
    }
    //$servername = preg_replace("/^.*Data Source=(.+?);.*$/", "\\1", $value);
    //$dbname = preg_replace("/^.*Database=(.+?);.*$/", "\\1", $value);
    //$username = preg_replace("/^.*User Id=(.+?);.*$/", "\\1", $value);
    //$password = preg_replace("/^.*Password=(.+?)$/", "\\1", $value);
}
// Create connection
echo "information: ".$servername." ". $username." ".$password." ".$dbname;
echo "<br>";
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "connection successful<br/>";
}
$sql = "INSERT INTO persons VALUES (".$_GET["id"].",'".$_GET["fname"]."','".$_GET["lname"]."','".$_GET["addr"]."','".$_GET["city"]."');";
echo $sql;
echo "<br>";
//echo $_GET["id"].$_GET["fname"].$_GET["lname"].$_GET["addr"].$_GET["city"];
$result = mysqli_query($conn, $sql );
echo $result;
echo "hello sammy";
mysqli_close($conn);
?>