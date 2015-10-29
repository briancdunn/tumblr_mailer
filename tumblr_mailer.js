var fs = require("fs");
var ejs = require("ejs");
var tumblr = require("tumblr.js");

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync("email_template.html","utf8");
console.log(renderEmails(emailTemplate,csvParse(csvFile)));

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

function renderEmails(template,contacts) {
	var customEmails = [];
	for(var i = 0; i < contacts.length; i++) {
		customEmails.push(ejs.render(template,{
			"firstName": contacts[i].firstName,
			"numMonthsSinceContact": contacts[i].numMonthsSinceContact
		}));
	}

	return customEmails;
}