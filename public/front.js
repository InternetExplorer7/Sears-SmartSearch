$(document).ready(function() {
        var socket = io();
        var price;
        var review;
        var item;
        var ship;
        var count = [];
        $("#submit").click(function() { // User enters some text
                $("#master").text("");
                price = undefined;
                review = undefined;
                item = undefined;
                ship = undefined;
                count = [];
                console.log("Here");
                $.ajax({
                        method: "POST",
                        url: "/translate.json",
                        data: {
                                text: $("#input").val()
                        },
                        success: function(filtered) {
                                parseJSON(filtered);
                        }
                });
                return false;
        });

        function sendAudio(text) {
                $.ajax({
                        method: "POST", 
                        url: "/speech.json",
                        data: {
                                item: text
                        },
                        success: function (audioloc) {
                                console.log(audioloc);
                                setTimeout(function(){
                                var audio = new Audio("uploads/" + audioloc + '.wav');
                                audio.play();
                                }, 3000)
                        }
                });
        }

        function parseJSON(data) { // Got JSON and product lineup, start processing.
                if (Object.keys(data.outcomes[0].entities).length === 0) {
                        console.log("Nothing detected");
                        return;
                }
                // Alright, I'm searching for + item;
                $.ajax({
                        method: "POST",
                        url: "/sears.json",
                        data: {
                                item: data.outcomes[0].entities.item[0].value
                        },
                        success: function(filtered) {
                                process(filtered, data); // Sears and Wit Response.
                        }
                });
        }

        function process(sears, wit) { // Create list, start going through data
                console.log("WIT: " + JSON.stringify(wit));
                console.log(JSON.stringify(sears));
                if (sears.SearchResults.Status.RespMessage !== "Successful") { // Data returned unsuccesfully
                        console.log("Error, could not get Data " + JSON.stringify(sears));

                } else {
                        console.log("Success");

                }

                if (sears.SearchResults.Products.length === 0) {
                        console.log("No results found");

                }
                if (wit.outcomes[0].entities.item) { // Item exists
                        item = wit.outcomes[0].entities.item[0].value;
                        console.log("Item: " + item);

                } else {
                        console.log("Item not found");

                }
                if (wit.outcomes[0].entities.price) {
                        price = parseInt((wit.outcomes[0].entities.price[0].value).substring(wit.outcomes[0].entities.price[0].value.indexOf('$') + 1));
                        console.log("Price: " + price);
                } else {
                        console.log("Price not found");
                }
                if (wit.outcomes[0].entities.review) { // Review exists
                        review = parseInt(wit.outcomes[0].entities.review[0].entities.reviewnum[0].value);
                        console.log("Review: " + review);
                } else {
                        console.log("Review not found");
                }
                if (wit.outcomes[0].entities.freeshipping) {
                        ship = wit.outcomes[0].entities.freeshipping[0].value;
                        console.log("Shipping: " + ship);
                } else {
                        console.log("Shipping not found");
                }

                /* =========================== START LOOPING THROUGH SEARS API ============================== */
                console.log("Price: " + typeof price);
                console.log("Review: " + typeof review);
                console.log("Ship: " +typeof  ship);
                sears.SearchResults.Products.forEach(function(product) {

                        /* ============================ Check if all Null ============================================ */
                        if (!price && !review && !ship) { // All null, pull up all results
                                $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> </div>"); // Appending all 25
                                console.log("All false");
                                count.push(product.Description.Name);
                        }

                        /* ============================ Check if all VALID ============================================ */
                        if(Object.keys(product.Price).length === 2 ) {
                                console.log("No price detected");
                        } else {

                        if (price && review && ship) {
                                console.log("Hit0");
                                console.log("DISPLAY PRICE: " + product.DisplayPrice);
                                if (product.Price.DisplayPrice.indexOf('F') === 0) { // Range detected
                                        var editprice = parseInt(product.Price.DisplayPrice.substring(5, product.Price.DisplayPrice.indexOf('T') - 1));
                                        if (editprice <= price && parseInt(product.Description.ReviewRating.Rating) >= review && product.Availability.FreeShippingEligible === "True") {
                                                count.push(product.Description.Name);
                                                $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>SHIPPING FREE</p> <p>" + product.Description.ReviewRating.Rating + "</p> </div>"); 

                                        }

                                } else if (parseInt(product.Price.DisplayPrice) <= price && parseInt(product.Description.ReviewRating.Rating) >= review && product.Availability.FreeShippingEligible === "True") { // Item is not a range
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>SHIPPING FREE</p> <p>" + product.Description.ReviewRating.Rating + "</p> </div>"); 
                                }
                        } else if (price && review) {
                                console.log("Hit1");
                                if (product.Price.DisplayPrice.indexOf('F') === 0) { // Range detected
                                        var editprice = parseInt(product.Price.DisplayPrice.substring(5, product.Price.DisplayPrice.indexOf('T') - 1));
                                        if (editprice <= price && parseInt(product.Description.ReviewRating.Rating) >= review) {
                                                count.push(product.Description.Name);
                                                $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>" + product.Description.ReviewRating.Rating + "</p> </div>"); 
                                        }
                                } else if (parseInt(product.Price.DisplayPrice) <= price && parseInt(product.Description.ReviewRating.Rating) >= review) { // Item is not a range
                                        console.log(product.Description.Name);
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>" + product.Description.ReviewRating.Rating + "</p> </div>"); 
                                }
                        } else if (price && ship) {
                                console.log("Hit2");
                                if (product.Price.DisplayPrice.indexOf('F') === 0) { // Range detected
                                        var editprice = parseInt(product.Price.DisplayPrice.substring(5, product.Price.DisplayPrice.indexOf('T') - 1));
                                        if (editprice <= price && product.Availability.FreeShippingEligible === "True") {
                                                count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>SHIPPING FREE</p> </div>"); 
                                        }
                                } else if (parseInt(product.Price.DisplayPrice) <= price && product.Availability.FreeShippingEligible === "True") { // Item is not a range
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>SHIPPING FREE</p> </div>"); 
                                }
                        } else if (review && ship) {
                                console.log("Hit3");
                                if (parseInt(product.Description.ReviewRating.Rating) >= review && product.Availability.FreeShippingEligible === "True") {
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>SHIPPING FREE</p> <p>" + product.Description.ReviewRating.Rating + "</p> </div>"); 
                                }
                        } else if (price) {
                                console.log("Hit4");
                                console.log(product.Price.DisplayPrice.indexOf('F'));
                                if (product.Price.DisplayPrice.indexOf('F') === 0) { // Range detected
                                        var editprice = parseInt(product.Price.DisplayPrice.substring(5, product.Price.DisplayPrice.indexOf('T') - 1));
                                        console.log("editPR: " + editprice);
                                        console.log("prod: " + price);
                                        if (editprice <= price) {
                                                count.push(product.Description.Name);
                                                $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> </div>"); 
                                        }
                                } else if (parseInt(product.Price.DisplayPrice) <= price) { // Item is not a range
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> </div>"); 
                                }

                        } else if (review) {
                                console.log("Hit");
                                if (parseInt(product.Description.ReviewRating.Rating) >= review) {
                                        console.log("Hit review single")
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> <p>" + product.Description.ReviewRating.Rating + "</p> </div>"); 
                                }

                        } else if (ship) {
                                console.log("Hit");
                                if (product.Availability.FreeShippingEligible === "True") {
                                        console.log("Hit Shipping single");
                                        count.push(product.Description.Name);
                                        $("#master").append("<div class='boxes'> <img src=" + product.Description.ImageURL + ">  <h1>" + product.Description.Name + "</h1> <h2> PRICE: " + product.Price.DisplayPrice + "</h2> </div>");
                                }
                        }
                }

                }); // For Each
                console.log(count);
                console.log(count.length);
                if(count.length <= 0) {sendAudio("I didn't find anything, please try searching again!")}

                // if(count.length <= 10 && count.length >= 1 ) { sendAudio("The first one is " + count[0])}

                if(count.length > 10) { sendAudio("I found a handful of items, the first one is " + count[0] + "     and the rest are shown on the page")}
        }
}); // document