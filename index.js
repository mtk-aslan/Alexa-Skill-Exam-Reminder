const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');


const messages = {
  WELCOME: 'Welcome to the Exam Reminder App!  You can say "create a reminder" to create a reminder.  What would you like to do?',
  WHAT_DO_YOU_WANT: 'What would you like to do?',
  NOTIFY_MISSING_PERMISSIONS: 'Please enable Reminder permissions in the Amazon Alexa app using the card I\'ve sent to your Alexa app.',
  ERROR: 'Uh Oh. Looks like something went wrong.',
  API_FAILURE: 'There was an error with the Reminders API.',
  GOODBYE: 'Bye! Thanks for using the Exam Reminder Skill!',
  UNHANDLED: 'This skill doesn\'t support that. Please ask something else.',
  HELP: 'You can use this skill by asking something like: create a reminder? or How am I in Chemistry?',
  REMINDER_CREATED: 'OK, I will remind you for learning.',
  UNSUPPORTED_DEVICE: 'Sorry, this device doesn\'t support reminders.',
  WELCOME_REMINDER_COUNT: 'Welcome to the Reminders API Demo Skill.  The number of your reminders related to this skill is ',
  NO_REMINDER: 'OK, I won\'t remind you.',
};

const messages_ger = {
  WELCOME: 'Willkommen zur Prüfungen App. Du kannst sagen "Trage Mathematik für den 23.04.2019 ein". Was willst du machen?',
  WHAT_DO_YOU_WANT: 'Was willst du tun?',
  NOTIFY_MISSING_PERMISSIONS: 'Please enable Reminder permissions in the Amazon Alexa app using the card I\'ve sent to your Alexa app.',
  ERROR: 'Ohh. Da ist etwas schief gelaufen',
  API_FAILURE: 'There was an error with the Reminders API.',
  GOODBYE: 'Bis dann',
  UNHANDLED: 'Das unterstütze ich nicht. Versuche was anderes.',
  HELP: 'Du kannst diesen Skill benutzen um Erinnerungen für deine Prüfung einzurichten.',
  REMINDER_CREATED: 'OK, deine Erinnerung ist erstellt.',
  UNSUPPORTED_DEVICE: 'Sorry, dieses Gerät unterstützt diese App nicht.',
  WELCOME_REMINDER_COUNT: 'Wilkommen zur Erinnerungs App.  Die Anzahl der Erinnerungen erstellt mit dieser App beträgt ',
  NO_REMINDER: 'OK, Ich werde dich nicht erinnern.',
}; //Vorbereitung auf die deutsche Version des Skills


const PERMISSIONS = ['alexa::alerts:reminders:skill:readwrite']; //Berechtigung für den Zugriff auf die Reminder Funktion Alexas

const globalListName = "Lern Fortschritt";  // Liste für den Lernfortschritt
var allReminders; // Liste in der alle Erinngerungen gespeichert werden
var allLists; // Alle Alexa Listen werden aufgelistet
var allItems; // Liste in der alle Lernfortschritte gespeichert werden


const LaunchRequestHandler = {   // wird beim Start des Skills immer als erstes aufgerufen
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const responseBuilder = handlerInput.responseBuilder;
    const consentToken = requestEnvelope.context.System.apiAccessToken;

    if (!consentToken) {
      // if no consent token, skip getting reminder count
      return responseBuilder
        .speak(messages.WELCOME)
        .reprompt(messages.WHAT_DO_YOU_WANT)
        .getResponse();
    }
    try {
        
      const client = handlerInput.serviceClientFactory.getReminderManagementServiceClient(); // Reminder Funktion initialisieren
      const remindersResponse = await client.getReminders();  // alle Erinnerungen lokal speichern
      console.log("Reminder Responser Code"+JSON.stringify(remindersResponse));
      
      const client_list = handlerInput.serviceClientFactory.getListManagementServiceClient(); // List Funktion initialisieren
      const getMetaList = await client_list.getListsMetadata();  // Auflisten aller Alexa Listen
      
      allReminders= getReminderList(remindersResponse); //List with all generatet Reminds
      allLists = getTodoListWithId(getMetaList.lists); //List with all Alexa Lists
      const identOfList = getIdOfList(allLists, globalListName);  // "Lern Fortschitt" Liste in Const speichern
      const getListWithItems= await client_list.getList(identOfList, "active"); // alle aktiven Elemente der Liste in Const speichern
      allItems= getItemsFromList(getListWithItems);  // Elemente in globale Variable und einfache Struktur umwandeln
      
      var boolCreateAskList=checkToDoList(allLists, globalListName); //if list is not generated this var is false
      console.log("Boolean Wert der Listen: "+ boolCreateAskList);
      
      
      if (boolCreateAskList===false){   //Checks whether List is already generatet or not
        const JsonList = {
            "name": globalListName, 	// List name, String, 256 chars
            "state": "active" 		// List state, Enum, "active" ONLY.
            };
        const createlist = await client_list.createList(JsonList);
        }
      
      return responseBuilder
        .speak(`${messages.WELCOME}`) //Generating Messages
        .reprompt(messages.WHAT_DO_YOU_WANT)
        .getResponse();
    } catch (error) { // Fehler abfangen
      console.log(`error message: ${error.message}`);
      console.log(`error stack: ${error.stack}`);
      console.log(`error status code: ${error.statusCode}`);
      console.log(`error response: ${error.response}`);

      if (error.name === 'ServiceError' && error.statusCode === 401) {
        console.log('No reminders permissions (yet).  Skipping reporting on reminder count.');
        return responseBuilder
          .speak(messages.WELCOME)
          .reprompt(messages.WHAT_DO_YOU_WANT)
          .getResponse();
      }
      if (error.name !== 'ServiceError') {
        console.log(`error: ${error.stack}`);
        const response = responseBuilder.speak(messages.ERROR).getResponse();
        return response;
      }
      throw error;
    }
  },
}; 

const CreateReminderHandler = {  //Erstellung von Erinnerungen
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'CreateReminderIntent';
  },
  async handle(handlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const responseBuilder = handlerInput.responseBuilder;
    const consentToken = requestEnvelope.context.System.apiAccessToken;

    // check for confirmation.  if not confirmed, delegate
    switch (requestEnvelope.request.intent.confirmationStatus) {
      case 'CONFIRMED':
        // intent is confirmed, so continue
        console.log('Alexa confirmed intent, so clear to create reminder');
        break;
      case 'DENIED':
        // intent was explicitly not confirmed, so skip creating the reminder
        console.log('Alexa disconfirmed the intent; not creating reminder');
        return responseBuilder
          .speak(`${messages.NO_REMINDER} ${messages.WHAT_DO_YOU_WANT}`)
          .reprompt(messages.WHAT_DO_YOU_WANT)
          .getResponse();
      case 'NONE':
      default:
        console.log('delegate back to Alexa to get confirmation');
        return responseBuilder
          .addDelegateDirective()
          .getResponse();

    }

    if (!consentToken) {
      return responseBuilder
        .speak(messages.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(PERMISSIONS)
        .getResponse();
    }
    try {
      const daysbefore= 28; // Tage die zurück liegen bei denen angefangen werden soll zu erinnern    
      const client = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
      const client_list = handlerInput.serviceClientFactory.getListManagementServiceClient();
      const slots = handlerInput.requestEnvelope.request.intent.slots; //Zugriff auf den Slot im Befehl
      var todaysDate= new Date();
      const daysDiff = mydiff(todaysDate, slots.date.value, "days");
      
      
    if (daysDiff>=daysbefore) { // if the exam is more than 28 days far away then use 
    const calculatedDates= getdate(slots.date.value, daysbefore); // Mit dem Prüfungsdatum wird ein Array mit Daten erzeugt   
    var i;
    for (i = 0; i < calculatedDates.length; i++) {
      const reminderRequest_absolute = getReminderJson(calculatedDates[i], slots.subject.value+" "+i);
      const reminderResponse = await client.createReminder(reminderRequest_absolute);
      console.log(JSON.stringify(reminderResponse));
        }
    } else {
        const calculatedDates_shorttime= getdate(slots.date.value, daysDiff); // if the exam is less than 28 days far away then use 
        var j;
        for (j = 0; j < calculatedDates_shorttime.length; j++) {
        const reminderRequest_absolute = getReminderJson(calculatedDates_shorttime[j], slots.subject.value+j);
        const reminderResponse = await client.createReminder(reminderRequest_absolute);
        console.log(JSON.stringify(reminderResponse));
        }
    }    
    const JsonListRemind = { //Test Erinnerung für die Studie
   "trigger": {
        "type" : "SCHEDULED_ABSOLUTE",
        "scheduledTime" : "2019-12-30T14:59:00.000",
        
   },
   "alertInfo": {
        "spokenInfo": {
            "content": [{
                "locale": "en-US", 
                "text": "go on and learn"
            }]
        }
    },
    "pushNotification" : {                            
         "status" : "ENABLED"
    }
};
        
        
    //const reminderResponse123 = await client.createReminder(JsonListRemind);
  
      const CreatingListItem= createItem(client_list, globalListName, slots.subject.value); //By creating a reminder creates also the item for the Subject in the In Built List of Alexa
        
      
      
    } catch (error) {
      if (error.name !== 'ServiceError') {
        console.log(`error: ${error.stack}`);
        const response = responseBuilder.speak(messages.ERROR).getResponse();
        return response;
      }
      throw error;
    }

    return responseBuilder
      .speak(messages.REMINDER_CREATED)
      .getResponse();
  },
};

const GetLearnProgress = { // Lernfortschritt ausgeben
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'GetLearnProgress';
  },
  async handle(handlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const responseBuilder = handlerInput.responseBuilder;
    
    try {
        const slots = handlerInput.requestEnvelope.request.intent.slots;  //Slots aus dem aktuellen Befehl speichern
        var slotValue;
        for (var i=0; i< allItems.length; i++){ 
             var x = allItems[i].name;
             if(x.includes(slots.subject.value)){ //Ausgabe des Prozentsatzes des Lernfortschrittes für das jeweilige Fach
                 slotValue=x;
                 return responseBuilder
                .speak("Your progress in "+slotValue.substring(0, slotValue.indexOf(":")) +" is "+ slotValue.substring(slotValue.indexOf(":")+1)+" percent. What do you want do next.")
                .reprompt()
                .getResponse(); 
            }
            else {
                 return responseBuilder
                .speak("There is no value for "+ slots.subject.value +".")
                .reprompt()
                .getResponse(); 
            }
        }
      
      
    } catch (error) {
      if (error.name !== 'ServiceError') {
        console.log(`error: ${error.stack}`);
        const response = responseBuilder.speak(messages.ERROR).getResponse();
        return response;
      }
      throw error;
    }
                
  },
};

const UpdateLearnProgress = { //Aktualisieren des Lernfortschrittes
    canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'UpdateLearnProgress';
  },
  async handle(handlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const responseBuilder = handlerInput.responseBuilder;
    const consentToken = requestEnvelope.context.System.apiAccessToken;

    // check for confirmation.  if not confirmed, delegate
    switch (requestEnvelope.request.intent.confirmationStatus) {
      case 'CONFIRMED':
        // intent is confirmed, so continue
        console.log('Alexa confirmed intent');
        break;
      case 'DENIED':
        // intent was explicitly not confirmed, so skip creating the reminder
        console.log('Alexa disconfirmed the intent;');
        return responseBuilder
          .speak(`${messages.NO_REMINDER} ${messages.WHAT_DO_YOU_WANT}`)
          .reprompt(messages.WHAT_DO_YOU_WANT)
          .getResponse();
      case 'NONE':
      default:
        console.log('delegate back to Alexa to get confirmation');
        return responseBuilder
          .addDelegateDirective()
          .getResponse();

    }

    if (!consentToken) {
      return responseBuilder
        .speak(messages.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(PERMISSIONS)
        .getResponse();
    }
    try {
      const slots = handlerInput.requestEnvelope.request.intent.slots;         
      const client_list = handlerInput.serviceClientFactory.getListManagementServiceClient();
      const identOfList = getIdOfList(allLists, globalListName);
      const getListWithItems= await client_list.getList(identOfList, "active");
      allItems= getItemsFromList(getListWithItems);
     
      
      const refreshItem= updateItem(client_list, identOfList, slots.subject.value, getIdOfItem(allItems, slots.subject.value), slots.percentage.value);  // Zugriff auf Updatefunktion in der In Built List
      console.log(`UPDATE ITEM Befehl: ${JSON.stringify(refreshItem)}`); 
      
      
      
    } catch (error) {
      if (error.name !== 'ServiceError') {
        console.log(`error: ${error.stack}`);
        const response = responseBuilder.speak(messages.ERROR).getResponse();
        return response;
      }
      throw error;
    }

    return responseBuilder
      .speak(`${messages.NO_REMINDER} ${messages.WHAT_DO_YOU_WANT}`)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.HELP)
      .reprompt(messages.HELP)
      .getResponse();
  },
};

const CancelStopHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.GOODBYE)
      .getResponse();
  },
};

const UnhandledHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.UNHANDLED)
      .reprompt(messages.UNHANDLED)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle(handlerInput, error) {
    return error.name === 'ServiceError';
  },
  handle(handlerInput, error) {
    // console.log(`ERROR STATUS: ${error.statusCode}`);
    console.log(`ERROR MESSAGE: ${error.message}`);
    // console.log(`ERROR RESPONSE: ${JSON.stringify(error.response)}`);
    // console.log(`ERROR STACK: ${error.stack}`);
    switch (error.statusCode) {
      case 401:
        return handlerInput.responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard(PERMISSIONS)
          .getResponse();
      case 403:
        return handlerInput.responseBuilder
          .speak(`${messages.UNSUPPORTED_DEVICE} ${messages.WHAT_DO_YOU_WANT}`)
          .reprompt(messages.WHAT_DO_YOU_WANT)
          .getResponse();
      default:
        return handlerInput.responseBuilder
          .speak(messages.API_FAILURE)
          .getResponse();
    }
  },
};

const RequestLog = {
  async process(handlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

const ResponseLog = {
  process(handlerInput) {
    console.log(`RESPONSE = ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`);
  },
};




/* Helper Functions */


function getReminderJson(date, subject) {  //Erstellung der JSON Anfrage...alle Erinnerungen sind auf 12 Uhr hardcodiert
    
    const reminderRequest = {
        trigger: {
        type : "SCHEDULED_ABSOLUTE",
        scheduledTime : date.slice(0,11)+"12:00:00.000",  
   },
   alertInfo: {
        spokenInfo: {
            content: [{
                locale: "en-US", 
                text: subject,
            }]
        }
    },
    pushNotification : {                            
         status : "ENABLED",
    }
      };
    return reminderRequest;
}

function mydiff(date1,date2,interval) { //https://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
    var second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
    date1 = new Date(date1);
    date2 = new Date(date2);
    var timediff = date2 - date1;
    if (isNaN(timediff)) return NaN;
    switch (interval) {
        case "years": return date2.getFullYear() - date1.getFullYear();
        case "months": return (
            ( date2.getFullYear() * 12 + date2.getMonth() )
            -
            ( date1.getFullYear() * 12 + date1.getMonth() )
        );
        case "weeks"  : return Math.floor(timediff / week);
        case "days"   : return Math.floor(timediff / day); 
        case "hours"  : return Math.floor(timediff / hour); 
        case "minutes": return Math.floor(timediff / minute);
        case "seconds": return Math.floor(timediff / second);
        default: return undefined;
    }
}

function getdate(givendate, days){   //https://www.toptal.com/software/definitive-guide-to-datetime-manipulation
    var cdate = new Date(givendate);
    var dates=[]; 
    var i;
    for (i = 0; i <= days/3; i++) {  //days/3 => die Anzahl der Erinngerungen die erstellt werden soll
        var nextDate=cdate.getDate()-3; // 3 => Der Abstand in denen die Daten erzeugt werden sollen
        cdate.setDate(nextDate);
        var changeddates=cdate.toJSON();
        dates.push(changeddates);
    }
 //https://timestamp.online/article/how-to-convert-timestamp-to-datetime-in-javascript

    return dates;
}


function shuffleArray(array) {  // Fisher Yates shuffle
 
    let currentIndex = array.length, temporaryValue, randomIndex; 
 
    while (0 !== currentIndex) { 
 
        randomIndex = Math.floor(Math.random() * currentIndex); 
        currentIndex -= 1; 
 
        temporaryValue = array[currentIndex]; 
        array[currentIndex] = array[randomIndex]; 
        array[randomIndex] = temporaryValue; 
    } 
 
    return array; 
} 

function getTodoListWithId (Json){ //returns the Lists of Alexa with their IDs you need the IDs for any further operations
        var contentList=[];
        for (var i = 0; i < Json.length; i++ ) {
            var array = {};
            array.name= Json[i].name;
            array.listId= Json[i].listId;
            contentList.push(array);
            }
        return contentList;    
}

function getReminderList(Json){ //generates the List of the saved Reminders 
     var remindList =[];
      for (var i = 0; i < Json.totalCount; i++ ) {
          var array={};
         array.name= Json.alerts[i].alertInfo.spokenInfo.content[0].text;
         array.remindID= Json.alerts[i].alertToken;
         array.date= Json.alerts[i].trigger.scheduledTime;
         remindList.push(array);
        }
        return remindList;
}

function getItemsFromList(Json){ //generates the List of the saved Items from the Learn Progress List
     var ListOfItems =[];
     for (var i = 0; i < Json.items.length; i++ ) {
         var array={};
         array.name = Json.items[i].value; 
         array.id = Json.items[i].id;
         ListOfItems.push(array);
     }
     return ListOfItems;
}

function checkToDoList(list, compareName){  //Looks wheter a list already exists or not
    var bool=false
    for (var i = 0; i < list.length; i++ ) {
          var x = list[i].name;
          if(x===compareName)
          bool=true;
          
      }
      return bool;
}


function getIdOfList(list, compareName){ //for creating an item in a list you need the ID of the List
    var itemlistId;
    for (var i = 0; i < list.length; i++ ) {
          var x = list[i].name;
          if(x===compareName)
          itemlistId=list[i].listId;
          
      }
      return itemlistId;
}
function getIdOfItem(itemList, compareName){ //Returns the ID of a given Item in a given In Built List
    var itemId;
    for (var i = 0; i < itemList.length; i++ ) {
    var x = itemList[i].name;
    if(x===compareName){
        itemId=itemList[i].id;    
        console.log(itemList[i].name+ " Das ist der Name des Items");
        }
    }
    return itemId;
}
function createItem(client, listname, itemName){ //creates an Item in the List
    var learnProgressValue=0;
    var Json={
    "value": itemName+": "+ learnProgressValue, //item value, with a string description up to 256 characters
    "status": "active" // item status (Enum: "active" or "completed")
        };
    for (var i=0; i < allLists.length; i++){
    if (allLists[i].name===listname){
        client.createListItem(allLists[i].listId,Json);
        }   
    }
}

function updateItem(client, listId, itemId,itemName, learnProgressValue) {
    var Json={
    "value": itemName+": "+ learnProgressValue, //item value, with a string description up to 256 characters
    "status": "active" // item status (Enum: "active" or "completed")
        };
    client.updateListItem(listId, itemId, Json);
    
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    CreateReminderHandler,
    GetLearnProgress,
    UpdateLearnProgress,
    SessionEndedRequestHandler,
    HelpHandler,
    CancelStopHandler,
    UnhandledHandler,
  )
  .addRequestInterceptors(RequestLog)
  .addResponseInterceptors(ResponseLog)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
  .lambda();
