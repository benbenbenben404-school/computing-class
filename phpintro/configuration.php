<?php
// open database connection
$servername = "127.0.0.1:50447";
$username = "azure";
$password = "6#vWHD_$";
$dbname = "chat"; // only bit you need to change
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

$sql = "SELECT username, password_hash FROM user WHERE username=$username";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
 echo "Username not unique";
 die();
}
$result = mysqli_query($conn, "SELECT * FROM persons");

//Use results to generate page content

// check that at least one set of results returned from query before displaying query results
if(mysqli_num_rows($result) > 0) {
    // display table headings for query results
echo "<table border='1'>";
    echo "<tr>  <th>PersonID</th>
    <th>FirstName</th>
    <th>LastName</th>
    <th>Address</th>
    <th>City</th>
    </tr>";

    // loop over each set of results
    while($row = mysqli_fetch_array($result)){
        // display data
    echo "<tr>  <td>".$row['PersonID']."</td>
        <td>".$row['FirstName']."</td>
        <td>".$row['LastName']."</td>
        <td>".$row['Address']."</td>
        <td>".$row['City']."</td>
        </tr>";}
    echo "</table>";}

else { // display error message
    echo "There are no matches for your search  criteria";}
                
// close the database connection
mysqli_close($conn);

?>