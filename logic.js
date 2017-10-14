/* global moment firebase */

// Initialize Firebase
// Make sure to match the configuration to the script version number in the HTML
// (Ex. 3.0 != 3.7.0)        
 var config = {
    apiKey: "AIzaSyChdJynwAdo_a7GDj9yJs8LcPmbb-aMflg",
    authDomain: "artsales-67ede.firebaseapp.com",
    databaseURL: "https://artsales-67ede.firebaseio.com",
    projectId: "artsales-67ede",
    storageBucket: "artsales-67ede.appspot.com",
    messagingSenderId: "3219538145"
  };
  firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// -----------------------------
// // // --------- Authentication code ------ // // //
// Track the UID of the current user.  
     var currentUid = null;  
     firebase.auth().onAuthStateChanged(function(user) {  
      // onAuthStateChanged listener triggers every time the user ID token changes.  
      // This could happen when a new user signs in or signs out.  
      // It could also happen when the current user ID token expires and is refreshed.  
      if (user && user.uid != currentUid) {  
       // Update the UI when a new user signs in.  
       // Otherwise ignore if this is a token refresh.  
       // Update the current user UID.  
       currentUid = user.uid;
       console.log(user.uid); 
       // document.body.innerHTML = '<h1> Congrats ' + user.displayName + ', you are done! </h1> <h2> Now get back to what you love building. </h2> <h2> Need to verify your email address or reset your password? Firebase can handle all of that for you using the email you provided: ' + user.email + '. <h/2>';  
      } else {  
       // Sign out operation. Reset the current user UID.  
       currentUid = null;  
       console.log("no user signed in");  
       window.location.href = "signin.html";
      }  
     });  


// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#connected-viewers").html(snap.numChildren());
});

// ------------------------------------
// Initial Values
var initialBid = 0;
var initialBidder = "No one :-(";
var initialEmail = "";
var highPrice = initialBid;
var highBidder = initialBidder;
var highEmail = initialEmail;

// --------------------------------------------------------------
// At the page load and subsequent value changes, get a snapshot of the local data.
// This function allows you to update your page in real-time when the values within the firebase node bidderData changes
database.ref("/bidderData").on("value", function(snapshot) {

  // If Firebase has a highPrice and highBidder stored (first case)
  if (snapshot.child("highBidder").exists() && snapshot.child("highPrice").exists() && snapshot.child("highEmail").exists()) {

    // Set the local variables for highBidder equal to the stored values in firebase.
    highBidder = snapshot.val().highBidder;
    highPrice = parseInt(snapshot.val().highPrice);
    // highEmail = snapshot.val().highEmail

    // change the HTML to reflect the newly updated local values (most recent information from firebase)
    $("#highest-bidder").html(snapshot.val().highBidder);
    $("#highest-price").html("$" + snapshot.val().highPrice);
    // $("#highest-email").html(snapshot.val(highEmail));

    // Print the local data to the console.
    console.log(snapshot.val().highBidder);
    console.log(snapshot.val().highPrice);
    console.log(snapshot.val().highEmail);
  }

  // Else Firebase doesn't have a highPrice/highBidder, so use the initial local values.
  else {

    // Change the HTML to reflect the local value in firebase
    $("#highest-bidder").html(highBidder);
    $("#highest-price").html("$" + highPrice);
    $("#highest-email").html(highEmail);

    // Print the local data to the console.
    console.log("local High Price");
    console.log(highBidder);
    console.log(highPrice);
    console.log(highEmail);
  }

  // If any errors are experienced, log them to console.
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

// --------------------------------------------------------------
// Whenever a user clicks the click button
$("#submit-bid").on("click", function(event) {
  event.preventDefault();

  // Get the input values
  var bidderName = $("#bidder-name").val().trim();
  var emailName = $("#email-input").val().trim();
  var bidderPrice = parseInt($("#bidder-price").val().trim());

  // Log the Bidder and Price (Even if not the highest)
  console.log(bidderName);
  console.log(bidderPrice);
  console.log(emailName);

  if (bidderPrice > highPrice) {

    // Alert
    alert("You are now the highest bidder.");

    // Save the new price in Firebase
    database.ref("/bidderData").push({
      highBidder: bidderName,
      highPrice: bidderPrice,
      highEmail:emailName
    });


    // Log the new High Price
    console.log("New High Price!");
    console.log(bidderName);
    console.log(bidderPrice);
    console.log(emailName);

    // Store the new high price and bidder name as a local variable (could have also used the Firebase variable)
    highBidder = bidderName;
    highPrice = parseInt(bidderPrice);
    highEmail = emailName;

    // Change the HTML to reflect the new high price and bidder
    $("#highest-bidder").html(bidderName);
    $("#highest-price").html("$" + bidderPrice);
    $("#highest-email").html(emailName);
  } else {

    // Alert
    alert("Sorry that bid is too low. Try again.");
  }});

database.ref("/bidderData").limitToLast(1).on("child_added", function(snapshot) {
      // storing the snapshot.val() in a variable for convenience
      var sv = snapshot.val();

      console.log("------- SV -------");
      console.log(sv.highPrice);

      $("#highest-price").html("$" + sv.highPrice);
      $("#highest-price").addClass("badge");
      $("#highest-price").addClass("searchBadge");
      $("#highest-price").addClass("badge-light");
      
    }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    });


//Countdown Function
// Set the date we're counting down to
var countDownDate = new Date("Oct 30, 2017 24:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get todays date and time
  var now = new Date().getTime();

  // Find the distance between now an the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("timer").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text 
  if (distance < 0) {
    document.getElementById("timer").innerHTML = "EXPIRED";
    $("#submit-bid").hide();
  }
}, 1000);


