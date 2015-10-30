var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js");
var mandrill = require('mandrill-api/mandrill');

var mandrill_client = new mandrill.Mandrill('zssVjhLhVOf70-k2gaE0HA');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var contactInfos = csvParse(csvFile);

var emailTemplate = fs.readFileSync("email_template.html","utf8");

var client = tumblr.createClient({
  consumer_key: 'TeE1aCnwHaMeCcDXXbKxeZKetIiPsWIxchMvSbZ44RBldYaAuQ',
  consumer_secret: 'mHZsZCKsvPTGSEFFHOvcGOL3KA6ZvbejJVO2vTJ2bAtMVXktRZ',
  token: 'XA7WJqlFw2bFPYhSJrpTWyvBEoEHv1Xfg8S6xLt2FDdbD0tCgQ',
  token_secret: 'BStpEcPtyJy3Em8TyOEomtFr8DSoZq0lckRFKx3SWkvf1uOLQI'
});

var latestPosts = [];
var emailHtmls = "";

client.posts('briandunn.tumblr.com', function(err, response){
		for(var i = 0; i < response.posts.length; i++) {
			if((new Date() - new Date(response.posts[i].date))<=604800000) {
				latestPosts.push({
					"href": response.posts[i].post_url,
					"title": response.posts[i].title
				});
			}
		}

		emailHtmls = renderEmails(emailTemplate,contactInfos,latestPosts);

		for(var i = 0; i < contactInfos.length; i++) {
			sendEmail(contactInfos[i].firstName + " " + contactInfos[i].lastName, contactInfos[i].emailAddress, "Brian Dunn", "briancollierdunn@gmail.com", "Tumblr Blog Update", emailHtmls[i]);
			console.log({"to": contactInfos[i].firstName + " " + contactInfos[i].lastName + "(" + contactInfos[i].emailAddress + ")",
				"from": "Brian Dunn (briancollierdunn@gmail.com)",
				"subject": "Tumblr Blog Update",
				"body": emailHtmls[i]
			});
		}
	});

function csvParse(csvInput) {
	var contacts = [];
	var csvArray = csvInput.split("\n");
	var singleContact = [];
	for(var i = 1; i < csvArray.length; i++) {
		singleContact = csvArray[i].split(",");
		if(singleContact.length == 4) {
			contacts.push({
				"firstName": singleContact[0],
				"lastName": singleContact[1],
				"numMonthsSinceContact": singleContact[2],
				"emailAddress": singleContact[3]
			});
		}
	}

	return contacts;
}

function renderEmails(template,contacts,posts) {
	var customEmails = [];
	for(var i = 0; i < contacts.length; i++) {
		customEmails.push(ejs.render(template,{
			"firstName": contacts[i].firstName,
			"numMonthsSinceContact": contacts[i].numMonthsSinceContact,
			"latestPosts": posts
		}));
	}

	return customEmails;
}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }