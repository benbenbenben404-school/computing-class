//Global variables that can be accessed anywhere in the program

//global_data contains all information about various chats, including messages, notifications, members and owner
var global_data = { chats: [] };
//Stores the username of the current user
var current_user = "";
//stores the id of the currently open chat
var current_chat = "";
//Stores a reference to the currently open panel
var current_panel = "";
//Stores the last time data was received from the server
var last_data_time = "";
//Stores a list of usernames to add to a new chat that will be created
var usernames_to_add = [];

//Functions to generate random numbers from strings
//These are used in the message display, to colour usernames 
//These are too specific and are out of scope for this project, so were taken from:
//https://stackoverflow.com/a/47593316
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)),
      (h = (h << 13) | (h >>> 19));
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

//Functions dealing with loading and setting themes

document.documentElement.setAttribute('data-theme', 'light');
//On page load, this loads the theme from local storage, and sets it
function load_theme() {
  //Check if the theme is set in local storage, and if its not set, set it to dark
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
  }

  //get the theme as theme from local storage
  var theme = localStorage.getItem("theme");
  //Set the theme in  the browser from local storage
  document.documentElement.setAttribute("data-theme", theme);
}
//This function toggles the theme
function toggle_theme() {
  //Get the theme as theme from local storage
  var theme = localStorage.getItem("theme");
  //If the theme is currently light, set it as dark in local storage and on the page, and vice versa
  if (theme == "light") {
    localStorage.setItem("theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  }
}

//Function that runs when the page is loaded, anodes some initial setup
function on_load() {
  //Loads the theme from local storage, if its been set
  load_theme();
  //Initially get all mesages and chat, by loading data since a very early time
  load_data("1970-01-01 10:00:00.123456");
  //Initially set current_panel to be the side window, which is necessary for mobile platforms
  current_panel = document.querySelector(".side-window");

  //Set up an event listener to send a message when the enter key is pressed, and also to check if the message box is valid, after it was blank
  document
    .querySelector("#message-input")
    .addEventListener("keyup", function (event) {
            //If the message box is not blank, set it as valid
            if (document.getElementById("message-input").value != "") {
              document.getElementById("message-input").setCustomValidity("");
            }
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        //Send the message
        send_message();
      }

    });
}

//Function that gets a modal by id, and shows it
function open_modal(modal_name) {
  // If the modal to create a chat is being opened, clear the validation on the chat name
  if (modal == "create-chat-modal") {
    document.querySelector("#create_chat_validation").style.display = "none";
    document.querySelector("#create-chat-modal #name").setCustomValidity("");
  }
  // Get the modal, and unhide it
  var modal = document.getElementById(modal_name);
  modal.style.display = "flex";
  //Add an event listener so that if the user clicks outside the modal, it closes it
  modal.addEventListener("click", function (event) {
    // If the user is clicking inside the modal, ignore the click
    if (event.currentTarget !== event.target) {
      return;
    }

    close_modal(modal_name);
  },
    false
  );
  // Add an event listener so that if the user presses the "escape key", it closes the modal
  document.addEventListener("keydown", function (event) {
    //Check that the area being clicked is not the modal itself, but the background around it
    if (event.key == "Escape") {
      close_modal(modal_name);
    }
  },
    false
  );

}

//Function to add a message to the page
//Arguments are:
//	content: text of the message
//	username: sender of the message
//	time: when the message was sent, as a timestamp, in the format YYYY-MM-DD hh:mm:ss.MMMMMM, ie  2038-01-19 03:14:07.123456
//	start: if true, the message is added at the bottom of the chat section, if false it's added at the top
function display_message(content, username, time, start) {
  //Get the chat section, and store how far through the user is scrolled, for later
  var chatSection = document.getElementById("chat");
  var scroll = chatSection.scrollBottom;
  //Check if the user is scrolled to the bottom of the chat section
  if (
    chatSection.scrollTop ===
    chatSection.scrollHeight - chatSection.offsetHeight
  ) {
    var at_bottom = true;
  } else {
    var at_bottom = false;
  }

  //get the correct template fot the HTML for a message
  //If the sender of the message is the currently logged in user, gets the correct template for this
  if (username == current_user) {
    var messageTemplate = document.getElementById("user-message");
  } else {
    var messageTemplate = document.getElementById("message");
  }
  //clone the message template into actual html, but dont add it to the actual page yet
  var message = messageTemplate.content.cloneNode(true);


  // Create a new time in the format of day mon year, hh:mm am, ie 15 Mar 2022, 10:02 am
  time_format = new Date(time.replace(" ", "T"));
  let options = {
    hour: "numeric",
    minute: "numeric",
    year: "numeric",
    month: "short",
    day: "numeric",
    hourCycle: "h12",
  };
  time_format = time_format.toLocaleString("en-GB", options);

  //set the username, time and content of the message
  message.querySelectorAll("b")[0].innerHTML = username+"2";
  // message.querySelectorAll("time")[0].innerHTML = time;
  message.querySelectorAll("time")[0].innerHTML = time_format;
  message.querySelectorAll("p")[0].innerHTML = content;

  //Set the color of the username
  //Generate a seed for the random number generator from the username
  var seed = xmur3(username);
  //generate h, a random number between 0 and 360, based on the seed of the username
  var rand = mulberry32(seed());
  var h = rand() * 360;

  //set the colour of the text of the username, in hsl
  message.querySelectorAll("b")[0].style.color =
    "hsl(" + String(h) + ",60%, 50%)";

  //add the message to the bottom of the chat section if start is true, else add it to the top
  if (start) {
    chatSection.appendChild(message);
  } else {
    chatSection.prepend(message);
  }

  //if message is added to the bottom, and the user was at the bottom, scroll the page down
  if (start && at_bottom) {
    chatSection.scrollTo(0, chatSection.scrollHeight);
  }
  if (!start) {
    chatSection.scrollTo(0, chatSection.scrollHeight - scroll);
  }
}

// Function gets all data from the server since a certain time, time
function load_data(time) {
  //setup the request
  var xhttp = new XMLHttpRequest();

  //setup the code to be ran if the request is successful
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //Store the returned data in data
      data = xhttp.responseXML;

      //If the current user is not known on the client, set it to the current user from the request
      if (!current_user) {
        current_user = data.getElementsByTagName("username")[0].childNodes[0].nodeValue;
      }


      //Get all chats from data, and iterate through them as chat
      chats = data.getElementsByTagName("chat");
      for (i = 0; i < chats.length; i++) {
        chat = chats[i];

        //Get the chat_id of the current chat
        //use let instead of var so that chat_id is local to this iteration of the loop, not the entire function
        let chat_id = chat.getElementsByTagName("chat_id")[0].childNodes[0].nodeValue;

        //If this chat is not already in global_data, add it, and perform some initial setup, setting the owner and name of chat
        if (!(chat_id in global_data["chats"])) {
          new_chat = {
            messages: [],
            "unread-messages": 0,
            owner: chat.getElementsByTagName("owner")[0].childNodes[0].nodeValue,
            "chat-name": chat.getElementsByTagName("name")[0].childNodes[0].nodeValue,
            users: [],
          };
          global_data["chats"][chat_id] = new_chat;
        }
        //Set the users in that chat in global data to the users returned from global data
        //Remove all users from the chat first, as this prevents user that have been removed from the chat from staying in the chat
        global_data["chats"][chat_id]["users"] = [];
        users = chat.getElementsByTagName("user");
        for (j = 0; j < users.length; j++) {
          global_data["chats"][chat_id]["users"].push(
            users[j].childNodes[0].nodeValue
          );
        }

        //Get all messages in the chat and add them to global_data
        messages = chat.getElementsByTagName("message");
        for (j = 0; j < messages.length; j++) {
          message = messages[j];
          //Get the content, sender, and time on each message, and add these to global_data
          mes_content = message.getElementsByTagName("content")[0].childNodes[0].nodeValue;
          mes_sender = message.getElementsByTagName("sender")[0].childNodes[0].nodeValue;
          mes_time = message.getElementsByTagName("time")[0].childNodes[0].nodeValue;
          global_data["chats"][chat_id]["messages"].push({
            content: mes_content,
            sender: mes_sender,
            time_sent: mes_time,
          });
          //If the chat being operated on is not the currently open chat, increment the unread-messages on it
          //This is to allow notifications to function
          //This also checks if the message was sent more recently than the last time the user closed the page, so that notifications are only shown for new messages
          if (current_chat != chat_id && localStorage.getItem("last_returned") < mes_time) {
            global_data["chats"][chat_id]["unread-messages"] += 1;
          }
          //If the chat the message is in is currently open, display the message, at the bottom of the chat
          if (chat_id == current_chat) {
            display_message(mes_content, mes_sender, mes_time, true);
          }
        }
      }
      //Store the last time data was gotten from the server in local storage.
      //this is necessary so that notifications are only gotten for new messages, if the user closes the page
      last_data_time = data.getElementsByTagName("time_returned")[0].childNodes[0].nodeValue;
      localStorage.setItem("last_returned", last_data_time);
      //Update the side panel, so that new chats or notifications are shown
      update_side_panel();

      //If the manage_chat panel is currently open, update it, incase the users in it have changed
      if (current_panel == document.getElementById("manage-window")) {
        manage_chat(current_chat);
      }
    }
    //If the request returns an error code 403, this means that the user is not logged in, so send them to the homepage
    else if (this.readyState == 4 && this.status == 403) {
      window.location.href = "index.html";
    }
    //When the request returns, even if it wasn't successful, set a timer to get data again in 1.5s
    if (this.readyState == 4) {
      setTimeout(function () {
        load_data(last_data_time);
      }, 1500);
    }
  };

  //Do some setup on the request, setting the url, request type, and header
  xhttp.open("POST", "../server/get_data.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //Send the request, with time as the  arguments
  xhttp.send("time=" + time);
}

//This function is called to update the side panel, with information from global_data
//It regenerates all the chat names, sets notifications, etc
function update_side_panel() {
  //Get Side panel as panel
  var panel = document.getElementById("chat-descriptor-container");

  //clear side panel
  panel.innerHTML = "";

  //Get template for a chat descriptor
  var descriptorTemplate = document.getElementById("chat-descriptor");

  //For each chat in global data, add a chat descriptor, with appropriate name and notifications
  for (let chat_id in global_data["chats"]) {
    //clone the chat descriptor template into actual html, but dont add it to the actual page yet
    var descriptor = descriptorTemplate.content.cloneNode(true);

    //set the name of the chat in the chat descriptor
    descriptor.querySelectorAll("p")[0].innerHTML = global_data["chats"][chat_id]["chat-name"];
    //If there are any notifications in the current chat, display the notification indicator, and set the number of notifications
    if (global_data["chats"][chat_id]["unread-messages"] != 0) {
      descriptor.querySelectorAll("span")[0].style.display = "block";
      descriptor.querySelectorAll("span")[0].innerHTML = global_data["chats"][chat_id]["unread-messages"];
    }
    //Add an on click event listener to the descriptor, so that clicking it runs an anonymous function, which shows the chat with the descriptors chat_id
    descriptor.querySelectorAll("div")[0].addEventListener(
      "click",
      function () {
        show_chat(chat_id);
      },
      false
    );
    //Add an on click event listener to the menu icon in descriptor, so that clicking it runs an anonymous function,
    //which opens the manage chat panel with the descriptors chat_id, then stops the event so it does not trigger the event listener to open the chat
    descriptor.querySelectorAll("svg")[0].addEventListener(
      "click",
      function () {
        manage_chat(chat_id);
        event.stopPropagation();
      },
      false
    );

    //Add the chat descriptor to the panel, after all the relevant information and event listeners have been set
    panel.appendChild(descriptor);
  }
}

//Simple function to switch which panel is shown in the main area.
//Takes in a css selector of which panel to show, ie ".manage-panel", and returns a reference to that panel
function switch_panel(panel_selector) {
  //get the panel to be shown as panel
  var panel = document.querySelector(panel_selector);
  //If there is currently a panel open, and it is not the side panel, hide the current panel
  if (current_panel && document.querySelector(".side-window") != current_panel) {
    current_panel.style.display = "none";
  }
  //Show the panel
  panel.style.display = "flex";

  //check if on mobile platform, and if so, hide side window
  if (window.innerWidth < 800) {
    document.getElementsByClassName("side-window")[0].style.display = "none";
  }
  //Store a reference to the panel in the global variable current_panel
  current_panel = panel;

  //return a reference to the panel
  return panel;
}

//This function open's and set's up the manage chat window for a given chat.
//As argument it takes in the id of the chat to manage
//depending on if the user owns the chat in question, it either shows the manage chat panel, or the view chat information panel, which are mostly the same
function manage_chat(chat_id) {
  //Set the current_chat to the chat_id, globally
  current_chat = chat_id;

  //Switch to the manage chat panel, and store a reference to the panel in panel
  var panel = switch_panel("#manage-window");

  //Clear all usernames that may currently be being displayed
  document.getElementById("username-box").innerHTML = "";

  //Hide buttons that may be displayed, and which should only be displayed depending on if the user owns the chat
  document.getElementById("add-people-button").style.display = "none";
  document.getElementById("leave-chat-button").style.display = "none";
  document.getElementById("delete-chat-button").style.display = "none";

  //get name of chat from global_data
  var chat_name = global_data["chats"][chat_id]["chat-name"];

  //Get members and owner of chat
  var usernames = global_data["chats"][chat_id]["users"];
  var owner = global_data["chats"][chat_id]["owner"];

  //set the chat name in the chat header
  panel.querySelector(".chat-header h2").innerHTML = chat_name;

  //Get the username display box, and template for a username display
  var display = document.getElementById("username-box");
  var usernameTemplate = document.getElementById("username-display");

  //Iterate through each user in the chat, to display their name in the panel
  for (let user in usernames) {
    //Js iterates through the keys of an array, not the values, so this gets the actual usernames
    user = usernames[user];

    //clone the username-display descriptor template into actual html, but dont add it to the actual page yet
    let user_display = usernameTemplate.content.cloneNode(true);

    //Set the text for the username in the display to the name of the user
    user_display.querySelector("b").innerHTML = user;

    //If the logged in user owns the chat, and is not the user currently being added, add a button to remove the user
    if (current_user == owner && user != owner) {
      //show the button
      user_display.querySelector(".small-button").style.display = "block";
      //Add an onclick event listener to the button to remove the user
      user_display.querySelector(".small-button").addEventListener(
        "click",
        function () {
          //make the web request to remove the user from the chat
          remove_from_chat(chat_id, user);
          //remove the user from the chat in global_data
          global_data["chats"][chat_id]["users"].splice(global_data["chats"][chat_id]["users"].indexOf(user),1);
          //update the manage chat panel to show that the user has been removed
          manage_chat(chat_id);
        },
        false
      );
    }
    //If the user being displayed is the owner, show an indicator showing this
    if (user == owner) {
      user_display.querySelector(".small-indicator").style.display = "block";
    }
    //Add the display to the panel
    display.appendChild(user_display);
  }
  //If the current user owns the current_chat, display, and set up buttons to delete and add people to the chat
  if (current_user == owner) {
    //Display the add people, and delete, buttons
    document.getElementById("add-people-button").style.display = "block";
    document.getElementById("delete-chat-button").style.display = "block";
    //Add an on click event listener to the delete chat button to delete the chat
    document.getElementById("delete-chat-button").addEventListener(
      "click",
      function () {
        //Send the request to delete the chat
        delete_chat(chat_id);
        //Delete the chat from global_data
        delete global_data["chats"][chat_id];
        //Update the side panel to reflect that the chat has been deleted
        update_side_panel();
        //Clear the panel
        clear_main_panel();
      },
      false
    );
  } else {
    //If the user does not own that chat, only show the button to leave the chat
    document.getElementById("leave-chat-button").style.display = "block";
    //Add an on click event listener to leave the chat
    document.getElementById("leave-chat-button").addEventListener(
      "click",
      function () {
        //Make the request to leave the chat
        remove_from_chat(chat_id, current_user);
        //Delete the chat from global_data
        delete global_data["chats"][chat_id];
        //Update the side panel to reflect that the chat has been deleted
        update_side_panel();
        //Clear the panel
        clear_main_panel();
      },
      false
    );
  }
}

//Function shows the chat panel, where messages are sent and received.
//Takes in chat_id as argument, which is the id of the chat to view
function show_chat(chat_id) {
  //Set the current_chat to chat_id
  current_chat = chat_id;

  //Switch to the chat-window panel, and keep a reference to the panel in panel
  var panel = switch_panel("#chat-window");

  //Clear the validation on the message input, in case the user previously tried to send a blank message
  document.getElementById("message-input").setCustomValidity("");
  //Get the chat_name, and all the messages in the chat, from global_data
  var chat_name = global_data["chats"][chat_id]["chat-name"];
  var messages = global_data["chats"][chat_id]["messages"];

  //Set the chat name in the chat header, and in the title of the tab
  panel.querySelector(".chat-header h2").innerHTML = chat_name;
  document.title = "Chat - " + chat_name;
  //Clear any messages currently shown
  panel.querySelector(".chat").innerHTML = "";

  //Iterate thorough all messages in the chat, and display them
  //This gets the content, time , and sender of the username from the global_data, and then displays them
  for (let message in messages) {
    let mes_content =global_data["chats"][chat_id]["messages"][message]["content"];
    let time = global_data["chats"][chat_id]["messages"][message]["time_sent"];
    let username = global_data["chats"][chat_id]["messages"][message]["sender"];
    display_message(mes_content, username, time, true);
  }
  //Set the number of unread messages on the chat to zero, then reload the side panel to reflect this
  global_data["chats"][chat_id]["unread-messages"] = 0;
  update_side_panel();

  //Scroll to the bottom of the chat, so that the most recent messages, at the bottom, are read first
  panel.scrollTo(0, panel.scrollHeight);
  //Get the actual message container, and add an on scroll so that when the user scrolls to the top of the page, it attempts to get some more, older messages from the server
  var chat_section = document.querySelector(".chat");
  chat_section.onscroll = function () {
    if (chat_section.scrollTop == 0) {
      get_50_more();
    }
  };
}

//Function to get 50 more messages from the servitor the current chat
function get_50_more() {
  //Set the time to get messages before as the time of the oldest message in global data
  var time = global_data["chats"][current_chat]["messages"][0]["time_sent"];

  //setup the request
  var xhttp = new XMLHttpRequest();

  //setup the code to be ran if the request is successful
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //Store the returned data in data
      data = xhttp.responseXML;

      //Get all the messages from the returned data
      messages = data.getElementsByTagName("message");
      //Iterate though each message to add them to the chat, and display them
      for (j = 0; j < messages.length; j++) {
        message = messages[j];
        //Get the content, time,and sender of the message
        mes_content =
          message.getElementsByTagName("content")[0].childNodes[0].nodeValue;
        mes_sender =
          message.getElementsByTagName("sender")[0].childNodes[0].nodeValue;
        mes_time =
          message.getElementsByTagName("time")[0].childNodes[0].nodeValue;

        //Add the message to global_data, at the start of the message array in the chat, so that it is older
        global_data["chats"][current_chat]["messages"].unshift({
          content: mes_content,
          sender: mes_sender,
          time_sent: mes_time,
        });

        //Also display the message at the top of the chat view
        display_message(mes_content, mes_sender, mes_time, false);
      }
    }
  };
  //Set the url, and a header
  xhttp.open("POST", "../server/get_50_more.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //send the request, with time, and the chat_id of the currently open chat as the arguments
  xhttp.send("time=" + time + "&chat_id=" + current_chat);
}


//Function to send a message to the currently open chat.
//Called when the user either presses te send button, or the enter key, and gets the message from the message box
function send_message() {
  //Clear the validation on the message input, in case the user previously tried to send a blank message
  document.getElementById("message-input").setCustomValidity("");
  //Get the contents of the message-input box
  var content = document.getElementById("message-input").value;
  //If the box is not empty, send the message
  if (content) {
    //Do some initial setup of the request, setting the url, header, and request type
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "../server/send_message.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //Send the request, with content as the contents of the message, and current_chat, the chat being sent to as chat_id
    xhttp.send(encodeURI("content=" + content + "&chat_id=" + current_chat));
    //Clear the message_box
    document.getElementById("message-input").value = "";
  } else {
    //If message box is blank, set a validation statement on the message input, so that it shows as invalid
    document.getElementById("message-input").setCustomValidity("Must not be blank");
  }

}

//Function to create a chat from the modal box
//Note that this function first creates the chat, then goes though all the users to add to the chat and adds them separately
function create_chat() {
  //Get the name of the chat to be created
  var chat_name = document.querySelector("#create-chat-modal #name").value;
  //If the chat name is not set, indicate this to the user, and stop processing
  if (!chat_name) {
    // Set and show a message for the user, warning them that the chat name cannot be blank
    document.querySelector("#create_chat_validation").innerHTML ="Chat name must not be blank";
    document.querySelector("#create_chat_validation").style.display = "block";
    //set a validation statement on the chat name input, so that it shows as invalid
    document.querySelector("#create-chat-modal #name").setCustomValidity(" ");
    return;
  }
  //Close the create chat modal
  close_modal("create-chat-modal");
  //Add the current user to the usernames to be added to the chat
  usernames_to_add.push(current_user);

  //Prepare the web request to create a chat, setting the url, and content type
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "../server/create_chat.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //when the request is successful, add all of the usernames to be added to the chat.
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //Get the chat id of the newly created chat, in order to be able to add users to it
      var chat_id = xhttp.responseText;

      //For each user in the usernames to add, add them to the newly created chat
      for (var user in usernames_to_add) {
        add_to_chat(chat_id, usernames_to_add[user]);
      }
      //Clear the usernames to add
      usernames_to_add = [];
    }
  };

  //Send the request to create the chat, with chat_name as the chat_name
  xhttp.send(encodeURI("chat_name=" + chat_name));
}


//This function is called to search for users from a modal. It is triggered by both the add users and create chat modals.
//As arguments it takes the input box to use to search with, and a callback function.
//This callback function is what contains the specific logic of what to do once the results are gotten, and is called once the results are gotten
function live_search(search_field, callback) {
  //Get the term to search for from the input box passed into the function
  var search_term = document.querySelector(search_field).value;
  //Prepare the web request, setting the url, and content type
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "../server/live_search.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  //When the request is successful, call the callback function with a list of all the usernames returned
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var usernames_returned =xhttp.responseXML.getElementsByTagName("username");

      callback(usernames_returned);
    }
  };
  //Send the request, with the search term, as argument
  xhttp.send(encodeURI("username=" + search_term));
}


//Function to generate the ui when the user searches for a user to add to a chat
//This should only be called as a callback from live_search, with usernames_searched being a list of all the usernames found
function search_for_user_to_add(usernames_searched) {
  //Get the results box, where the results will be displayed
  var results = document.querySelector("#add-people-modal .members");
  //clear the results box
  results.innerHTML = "";
  //Iterate through all of the usernames gotten from the search, and add them to the box
  for (let i = 0; i < usernames_searched.length; i++) {
    let user = usernames_searched[i].childNodes[0].nodeValue;

    //If the current user is already in the chat, there should be an indicator showing this
    if (global_data["chats"][current_chat]["users"].includes(user)) {
      //Get the template for display of a user that's already been added to a chat, and clone it
      var resultTemplate = document.getElementById("username-added-button");
      var result = resultTemplate.content.cloneNode(true);

      //change the username in the template to that of the user
      result.querySelectorAll("b")[0].innerHTML = user;
      //add the newly built display to the results box
      results.appendChild(result);
    } else {
      //If the user is not in the chat

      //Get the template for display of a user that is not already in  a chat, and clone it
      var resultTemplate = document.getElementById("username-add-button");
      let result = resultTemplate.content.cloneNode(true);

      //change the username in the template to that of the user
      result.querySelectorAll("b")[0].innerHTML = user;
      //Add an event listener to the button in the display to add the user to the chat
      result.querySelectorAll("button")[0].addEventListener(
        "click",
        function () {
          //when pressed, add the user to the chat
          add_to_chat(current_chat, user);
          //change the button to an indicator that the user has been added
          this.className = "small-indicator";
          this.innerHTML = "Added";
        },
        false
      );
      //add the newly built display to the results box
      results.appendChild(result);
    }
  }
}

//Function to generate the ui when the user searches for a user to add to a chat when creating a chat
//When a user is "added" from this modal, it wont actually send a request to do this, as the chat hasn't been created.
//Instead, it adds the users to an array, and all the users in this array are added when the chat is created
//This should only be called as a callback from live_search, with usernames_searched being a list of all the usernames found
function search_for_user_to_create(usernames_searched) {
  //Get the results box, where the results will be displayed
  var results = document.querySelector("#create-chat-modal .members");
  //clear the results box
  results.innerHTML = "";
  //Iterate through all of the usernames gotten from the search, and add them to the box
  for (let i = 0; i < usernames_searched.length; i++) {
    let user = usernames_searched[i].childNodes[0].nodeValue;
    // If the user is the currently logged in user, it shouldn't be added in the results
    if (user == current_user) {
      continue;
    }
    //If the user is already in the users to add, add a button showing that the user has been added
    if (usernames_to_add.includes(user)) {
      //Get and clone the template for a button shawn that a user has been added
      var resultTemplate = document.getElementById("username-added-button");
      var result = resultTemplate.content.cloneNode(true);

      //Set the username in the display
      result.querySelectorAll("b")[0].innerHTML = user;
      //Add an event listener to the button to remove the user from the users to add to a chat when the button is clicked
      result.querySelectorAll("button")[0].addEventListener(
        "click",
        function () {
          //remove the user from the array
          usernames_to_add.splice(usernames_to_add.indexOf(user), 1);
          //Regenerate the modal, to reflect that the user has been removed
          search_for_user_to_create(usernames_searched);
        },
        false
      );
      //Add the display to the display box, now that it has been generated
      results.appendChild(result);
    } else {
      //If the user is not  in the users to add, add a button to add the user
      //Get and clone the template for a button to add a user
      var resultTemplate = document.getElementById("username-add-button");
      let result = resultTemplate.content.cloneNode(true);

      //Set the username in the display
      result.querySelectorAll("b")[0].innerHTML = user;
      //Add an event listener to the button to add the user from the users to add to a chat when the button is clicked
      result.querySelectorAll("button")[0].addEventListener(
        "click",
        function () {
          //Add the user to the array of users to add
          usernames_to_add.push(user);
          //Regenerate the search modal to reflect that the user has been added
          search_for_user_to_create(usernames_searched);
        },
        false
      );
      //Add the display to the display box, now that it has been generated
      results.appendChild(result);
    }
  }
}

//Function to remove a panel, leaving the screen blank
function close_panel() {
  //Hide the panel
  current_panel.style.display = "none";
  //Show the side panel, incase this is on mobile and it is hidden
  var side_panel = document.querySelector(".side-window");
  side_panel.style.display = "flex";
  //Set the current panel to be the side panel
  current_panel = side_panel;
}

//Function that gets a modal by id, and hides it
function close_modal(modal) {
  var modal = document.getElementById(modal);
  modal.style.display = "none";
}

//Function that hides the main panel
function clear_main_panel() {
  current_panel.style.display = "none";
}

//Function to make the request to remove a user from a chat
//arguments are the username to remove, and the chat to remove from
function remove_from_chat(chat_id, user_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "../server/remove_user.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(encodeURI("user_id=" + user_id + "&chat_id=" + chat_id));
}

//Function to make the request to delete a chat
//arguments are the chat to delete
function delete_chat(chat_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "../server/delete_chat.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(encodeURI("chat_id=" + chat_id));
}

//Function to make the request to add a user to a chat
//arguments are the username to add, and the chat to add them to
function add_to_chat(chat_id, user_id) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "../server/add_user.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(encodeURI("user_id=" + user_id + "&chat_id=" + chat_id));
}
